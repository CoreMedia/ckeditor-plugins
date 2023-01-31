import ViewDocument from "@ckeditor/ckeditor5-engine/src/view/document";
import ViewDocumentFragment from "@ckeditor/ckeditor5-engine/src/view/documentfragment";
import HtmlDataProcessor from "@ckeditor/ckeditor5-engine/src/dataprocessor/htmldataprocessor";
import { DataProcessor } from "@ckeditor/ckeditor5-engine/src/dataprocessor/dataprocessor";
import { MatcherPattern } from "@ckeditor/ckeditor5-engine/src/view/matcher";
import Logger from "@coremedia/ckeditor5-logging/logging/Logger";
import LoggerProvider from "@coremedia/ckeditor5-logging/logging/LoggerProvider";
import DomConverter from "@ckeditor/ckeditor5-engine/src/view/domconverter";
import RichTextXmlWriter from "./RichTextXmlWriter";
import { COREMEDIA_RICHTEXT_NAMESPACE_URI, COREMEDIA_RICHTEXT_PLUGIN_NAME } from "./Constants";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import ObservableMixin, { Observable } from "@ckeditor/ckeditor5-utils/src/observablemixin";
import mix from "@ckeditor/ckeditor5-utils/src/mix";
import { parseRule, RuleConfig, RuleSection } from "@coremedia/ckeditor5-dom-converter/Rule";
import { declareCoreMediaRichText10Entities } from "./Entities";
import { defaultRules } from "./rules/DefaultRules";
import { Strictness } from "./Strictness";
import { registerNamespacePrefixes } from "@coremedia/ckeditor5-dom-support/Namespaces";
import { TrackingSanitationListener } from "./sanitation/TrackingSanitationListener";
import { RichTextSanitizer } from "./sanitation/RichTextSanitizer";
import { getLatestCoreMediaRichTextConfig } from "./CoreMediaRichTextConfig";
import { RuleBasedConversionListener } from "@coremedia/ckeditor5-dom-converter/RuleBasedConversionListener";
import { HtmlDomConverter } from "@coremedia/ckeditor5-dom-converter/HtmlDomConverter";

/**
 * Creates an empty CoreMedia RichText Document with required namespace
 * and processing instructions.
 */
const createCoreMediaRichTextDocument = (): Document => {
  const doc: Document = document.implementation.createDocument(COREMEDIA_RICHTEXT_NAMESPACE_URI, "div");
  const pi = doc.createProcessingInstruction("xml", 'version="1.0" encoding="utf-8"');
  doc.insertBefore(pi, doc.firstChild);
  return doc;
};

/**
 * Creates a new empty HTML document.
 */
const createHtmlDocument = (): Document => document.implementation.createHTMLDocument();

/**
 * Type guard for `RichTextDataProcessor`.
 *
 * Especially meant to be used from plugins, to determine, if a data processor
 * set at CKEditor 5 instance, is the `RichTextDataProcessor` you may want to
 * add rules to.
 *
 * @param value - value to validate
 */
export const isRichTextDataProcessor = (value: unknown): value is RichTextDataProcessor =>
  value instanceof RichTextDataProcessor;

/**
 * Data-Processor for CoreMedia RichText 1.0.
 */
class RichTextDataProcessor implements DataProcessor {
  static readonly #logger: Logger = LoggerProvider.getLogger(COREMEDIA_RICHTEXT_PLUGIN_NAME);
  static readonly #PARSER_ERROR_NAMESPACE = "http://www.w3.org/1999/xhtml";
  readonly #delegate: HtmlDataProcessor;
  readonly #domConverter: DomConverter;
  readonly #richTextXmlWriter: RichTextXmlWriter;
  readonly #domParser: DOMParser;
  readonly #noParserErrorNamespace: boolean;
  readonly #strictness: Strictness;

  /**
   * Set of rules to apply on data view to data mapping (or: from CKEditor HTML
   * in data view to CoreMedia Rich Text 1.0 in data).
   *
   * Note, that any update is expected to sort the rule sections according
   * to their priority.
   */
  readonly #toDataRules: RuleSection[] = [];
  /**
   * Set of rules to apply on view to data view mapping (or: from CoreMedia
   * Rich Text 1.0 in data to CKEditor HTML in data view).
   *
   * Note, that any update is expected to sort the rule sections according
   * to their priority.
   */
  readonly #toViewRules: RuleSection[] = [];
  /**
   * Conversion listener for `toData` processing. Expected to be updated
   * on changes on `toDataRules`.
   */
  readonly #toDataConversionListener = new RuleBasedConversionListener();
  /**
   * Conversion listener for `toData` processing. Expected to be updated
   * on changes on `toViewRules`.
   */
  readonly #toViewConversionListener = new RuleBasedConversionListener();

  /**
   * Constructor of plugin.
   *
   * @param editor - editor instance, the plugin belongs to
   */
  constructor(editor: Editor) {
    const document: ViewDocument = editor.data.viewDocument;

    this.#delegate = new HtmlDataProcessor(document);
    // Remember and re-use DOM converter.
    this.#domConverter = this.#delegate.domConverter;
    this.#richTextXmlWriter = new RichTextXmlWriter();
    this.#domParser = new DOMParser();

    this.#noParserErrorNamespace = this.#isNoParserErrorNamespace(this.#domParser);

    const config = getLatestCoreMediaRichTextConfig(editor.config);

    this.#strictness = config.strictness;

    this.addRules([...defaultRules, ...config.rules]);

    /*
     * We need to mark xdiff:span as elements preserving spaces. Otherwise,
     * CKEditor would consider adding filler nodes inside xdiff:span elements
     * only containing spaces. As xdiff:span is only meant to be used in
     * read-only CKEditor, there is no issue, preventing the filler node
     * from being inserted.
     *
     * Possible alternative: When mapping `xdiff:span` we could replace any
     * whitespaces with non-breakable-spaces. This solution is cumbersome,
     * though, so this solution was the easiest one.
     *
     * See also: ckeditor/ckeditor5#12324
     */
    // @ts-expect-error Typings at DefinitelyTyped only allow this to contain
    // `pre` element. But for TypeScript migration, CKEditor replaced typing
    // by `string[]` instead.
    this.#delegate.domConverter.preElements.push("xdiff:span");
  }

  registerRawContentMatcher(pattern: MatcherPattern): void {
    this.#delegate.registerRawContentMatcher(pattern);
  }

  useFillerType(type: "default" | "marked"): void {
    this.#delegate.useFillerType(type);
  }

  /**
   * Adds a single rule without triggering resorting. Prior to adding,
   * parses the configuration and adds result to corresponding sections
   * for `toData` or `toView` mapping or both.
   *
   * @param config - configuration to parse and add
   */
  #addRule(config: RuleConfig): void {
    const { toData, toView } = parseRule(config);
    if (toData) {
      this.#toDataRules.push(toData);
    }
    if (toView) {
      this.#toViewRules.push(toView);
    }
  }

  /**
   * Adds a single rule configuration.
   *
   * Note, that for adding multiple rules at once, `addRules` is preferred
   * instead.
   *
   * @param config - configuration to add
   */
  addRule(config: RuleConfig): void {
    this.addRules([config]);
  }

  /**
   * Adds a set of rules to the configuration.
   *
   * @param configs - configurations to add
   */
  addRules(configs: RuleConfig[]): void {
    const logger = RichTextDataProcessor.#logger;

    configs.forEach((config) => this.#addRule(config));

    this.#modifiedRules();

    if (logger.isDebugEnabled()) {
      logger.debug(`${configs.length} rule configurations added.`);
      this.dumpRules();
    }
  }

  /**
   * Triggers updating caches for rules when rules got modified.
   */
  #modifiedRules(): void {
    this.#toViewConversionListener.setRules(this.#toViewRules);
    this.#toDataConversionListener.setRules(this.#toDataRules);
  }

  /**
   * Dumps applied rule IDs.
   */
  dumpRules(): void {
    const logger = RichTextDataProcessor.#logger;
    if (logger.isDebugEnabled()) {
      logger.debug(`toData Rules (${this.#toDataRules.length}):`);
      this.#toDataConversionListener.dumpRules(logger.debug, "\t");
      logger.debug(`toView Rules (${this.#toViewRules.length}):`);
      this.#toViewConversionListener.dumpRules(logger.debug, "\t");
    }
  }

  /**
   * Transforms data to data view, thus, from CoreMedia Rich Text 1.0
   * to CKEditor 5 HTML as expected in data view by CKEditor.
   *
   * @param data - data to transform
   */
  toView(data: string): ViewDocumentFragment | null {
    const logger = RichTextDataProcessor.#logger;
    const startTimestamp = performance.now();

    const dataDocument = this.#parseData(data);
    const htmlDocument = createHtmlDocument();

    const converter = new HtmlDomConverter(htmlDocument, this.#toViewConversionListener);

    const range = dataDocument.createRange();
    range.selectNodeContents(dataDocument.documentElement);
    const dataFragment = range.extractContents();

    converter.convertAndAppend(dataFragment, htmlDocument.body);

    const { innerHTML: dataView } = htmlDocument.body;

    const viewFragment = this.#delegate.toView(dataView);

    if (logger.isDebugEnabled()) {
      logger.debug(`Transformed RichText to HTML within ${performance.now() - startTimestamp} ms:`, {
        in: data,
        out: dataView,
        viewFragment,
      });
    }

    // Mainly for debugging/testing purpose, we provide the interim
    // processing result with the original data and the intermediate
    // _data view_ as provided after data-processing.
    this.fire("richtext:toView", {
      data,
      dataView,
    });

    return viewFragment;
  }

  /**
   * Transforms CKEditor HTML to CoreMedia RichText 1.0. Note, that
   * to trigger data processor for empty text as well, you have to set the
   * option `trim: 'none'` on `CKEditor.getData()`.
   *
   * @param viewFragment - fragment from view model to process
   * @returns CoreMedia RichText 1.0 XML as string
   */
  toData(viewFragment: ViewDocumentFragment): string {
    const logger = RichTextDataProcessor.#logger;
    const startTimestamp = performance.now();

    const dataDocument = createCoreMediaRichTextDocument();
    const { htmlDomFragment, fragmentAsStringForDebugging } = this.initToData(viewFragment);

    const converter = new HtmlDomConverter(dataDocument, this.#toDataConversionListener);

    converter.convertAndAppend(htmlDomFragment, dataDocument.documentElement);

    new RichTextSanitizer(this.#strictness, new TrackingSanitationListener(logger)).sanitize(dataDocument);

    // We have to do this late, as sanitation may have removed
    // elements/attributes, whose namespace prefixes may otherwise be registered
    // although unused in the end.
    registerNamespacePrefixes(dataDocument);

    const xml = this.#richTextXmlWriter.getXml(dataDocument);
    logger.debug(`Transformed HTML to RichText within ${performance.now() - startTimestamp} ms:`, {
      in: fragmentAsStringForDebugging,
      out: xml,
    });

    return xml;
  }

  /**
   * Prepares toData transformation.
   *
   * @param viewFragment - view fragment to transform
   * @returns `domFragment` the view DOM-structure to transform;
   * `fragmentAsStringForDebugging` some representation of `domFragment` to be used for debugging — it will only
   * be initialized, if debug logging is turned on.
   */
  initToData(viewFragment: ViewDocumentFragment): {
    htmlDomFragment: Node | DocumentFragment;
    fragmentAsStringForDebugging: string;
  } {
    // @ts-expect-error Typings did not incorporate 35.0.1 signature change yet: 2nd Document Argument is gone.
    const htmlDomFragment: Node | DocumentFragment = this.#domConverter.viewToDom(viewFragment);
    let fragmentAsStringForDebugging = "uninitialized";

    if (RichTextDataProcessor.#logger.isDebugEnabled()) {
      fragmentAsStringForDebugging = this.#fragmentToString(htmlDomFragment);

      RichTextDataProcessor.#logger.debug("toData: ViewFragment converted to DOM.", {
        view: viewFragment,
        dom: htmlDomFragment,
        domAsString: fragmentAsStringForDebugging,
      });
    }
    return {
      htmlDomFragment,
      fragmentAsStringForDebugging,
    };
  }

  /**
   * Transform a fragment into an HTML string for debugging purpose.
   *
   * @param domFragment - fragment to transform
   */
  #fragmentToString(domFragment: Node | DocumentFragment): string {
    return (
      Array.from(domFragment.childNodes)
        .map((cn) => (cn as Element).outerHTML || cn.nodeValue)
        .reduce((result, s) => (result ?? "") + (s ?? "")) ?? ""
    );
  }

  /**
   * Parses the incoming data. On parsing error as well as on empty data, an
   * empty document is returned.
   *
   * @param data - data to parse
   */
  #parseData(data: string): Document {
    const logger = RichTextDataProcessor.#logger;

    if (!data) {
      return createCoreMediaRichTextDocument();
    }

    const dataDocument = this.#domParser.parseFromString(declareCoreMediaRichText10Entities(data), "text/xml");

    if (this.#isParserError(dataDocument)) {
      logger.error("Failed parsing data. See debug messages for details.", { data });
      if (logger.isDebugEnabled()) {
        // noinspection InnerHTMLJS
        const parsererror = dataDocument.documentElement.innerHTML;
        logger.debug("Failed parsing data.", { parsererror });
      }
      return createCoreMediaRichTextDocument();
    }

    return dataDocument;
  }

  /**
   * Detects, if current DOM implementation provides a namespace for
   * `<parsererror>` elements. PhantomJS, for example, does not provide
   * such a namespace URI.
   *
   * @param parser - DOM parser to use
   */
  // https://stackoverflow.com/questions/11563554/how-do-i-detect-xml-parsing-errors-when-using-javascripts-domparser-in-a-cross
  #isNoParserErrorNamespace(parser: DOMParser): boolean {
    const parserErrorDocument = parser.parseFromString("<", "text/xml");
    return (
      RichTextDataProcessor.#PARSER_ERROR_NAMESPACE !==
      parserErrorDocument.getElementsByTagName("parsererror")[0].namespaceURI
    );
  }

  /**
   * Validates, if the document represents a parser error to trigger
   * well-behaved behavior for failed parsing of data.
   *
   * @param parsedDocument - document to analyze
   */
  // https://stackoverflow.com/questions/11563554/how-do-i-detect-xml-parsing-errors-when-using-javascripts-domparser-in-a-cross
  #isParserError(parsedDocument: Document) {
    const namespace = RichTextDataProcessor.#PARSER_ERROR_NAMESPACE;
    if (this.#noParserErrorNamespace) {
      // In PhantomJS the parseerror element doesn't seem to have a special namespace, so we are just guessing here :(
      return parsedDocument.getElementsByTagName("parsererror").length > 0;
    }

    return parsedDocument.getElementsByTagNameNS(namespace, "parsererror").length > 0;
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface RichTextDataProcessor extends Observable {}

mix(RichTextDataProcessor, ObservableMixin);

export default RichTextDataProcessor;
