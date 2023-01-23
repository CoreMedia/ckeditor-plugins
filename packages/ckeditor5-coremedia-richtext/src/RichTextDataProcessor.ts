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
import { RuleBasedHtmlDomConverter } from "@coremedia/ckeditor5-dom-converter/RuleBasedHtmlDomConverter";
import { byPriority, parseRule, RuleConfig, RuleSection } from "@coremedia/ckeditor5-dom-converter/Rule";
import { declareCoreMediaRichText10Entities } from "./Entities";
import { defaultRules } from "./rules/DefaultRules";
import { RichTextSanitizer } from "./sanitation/RichTextSanitizer";
import { Strictness } from "./Strictness";
import { registerNamespacePrefixes } from "@coremedia/ckeditor5-dom-support/Namespaces";
import { TrackingSanitationListener } from "./sanitation/TrackingSanitationListener";

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

  readonly toDataRules: RuleSection[] = [];
  readonly toViewRules: RuleSection[] = [];

  constructor(editor: Editor) {
    const document: ViewDocument = editor.data.viewDocument;

    this.#delegate = new HtmlDataProcessor(document);
    // renderingMode: "data" - Fixes observed issue ckeditor/ckeditor5#11786
    this.#domConverter = new DomConverter(document, { renderingMode: "data" });
    this.#richTextXmlWriter = new RichTextXmlWriter();
    this.#domParser = new DOMParser();

    const parserErrorDocument = this.#domParser.parseFromString("<", "text/xml");
    this.#noParserErrorNamespace =
      RichTextDataProcessor.#PARSER_ERROR_NAMESPACE !==
      parserErrorDocument.getElementsByTagName("parsererror")[0].namespaceURI;

    this.addRules(...defaultRules);
    // This rule should later move to Differencing Plugin
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
    this.#addRule({
      toView: {
        id: "differencing-represent-empty-span-by-br",
        importedWithChildren: (node, { api }): Node => {
          if (!(node instanceof Element) || node.prefix !== "xdiff" || node.localName !== "span") {
            return node;
          }
          // Later, in model, we cannot distinguish `<xdiff:span/>` representing
          // a newline (added, removed, changed) from `<xdiff:span> </xdiff:span>`
          // which is some whitespace change. Because of that, we introduce a
          // virtual new element here, which signals a newline change.
          // TODO: Something is broken here and needs to be validated: `<xdiff:br>`
          //   elements are no longer created. As it seems, corresponding nodes are
          //   not detected as being empty anymore.
          if (!node.hasChildNodes()) {
            // TODO: No namespace handling. It is an artificial element anyway.
            //   Task is to check, whether we want to declare a namespace.
            // eslint-disable-next-line no-null/no-null
            return api.targetDocument.createElement("xdiff:br");
          }
          // Whitespace-Only contents: Instead of applying corresponding processing
          // here, we handle this in `RichTextDataProcessor` by declaring
          // `xdiff:span` to be a `preElement`.
          // See also: ckeditor/ckeditor5#12324
          return node;
        },
      },
    });
  }

  registerRawContentMatcher(pattern: MatcherPattern): void {
    this.#delegate.registerRawContentMatcher(pattern);
    this.#domConverter.registerRawContentMatcher(pattern);
  }

  useFillerType(type: "default" | "marked"): void {
    this.#domConverter.blockFillerMode = type === "marked" ? "markedNbsp" : "nbsp";
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

    const converter = new RuleBasedHtmlDomConverter(dataDocument, this.toDataRules);
    const converted = converter.convert(htmlDomFragment);
    if (converted) {
      dataDocument.documentElement.append(converted);
    }

    new RichTextSanitizer(Strictness.STRICT, new TrackingSanitationListener(logger)).sanitize(dataDocument);

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

  // https://stackoverflow.com/questions/11563554/how-do-i-detect-xml-parsing-errors-when-using-javascripts-domparser-in-a-cross
  #isParserError(parsedDocument: Document) {
    const namespace = RichTextDataProcessor.#PARSER_ERROR_NAMESPACE;
    if (this.#noParserErrorNamespace) {
      // In PhantomJS the parseerror element doesn't seem to have a special namespace, so we are just guessing here :(
      return parsedDocument.getElementsByTagName("parsererror").length > 0;
    }

    return parsedDocument.getElementsByTagNameNS(namespace, "parsererror").length > 0;
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

  #addRule(config: RuleConfig): void {
    const { toData, toView } = parseRule(config);
    if (toData) {
      this.toDataRules.push(toData);
    }
    if (toView) {
      this.toViewRules.push(toView);
    }
  }

  addRules(...configs: RuleConfig[]): void {
    configs.forEach((config) => this.#addRule(config));
    this.toDataRules.sort(byPriority);
    this.toViewRules.sort(byPriority);
  }

  toView(data: string): ViewDocumentFragment | null {
    const logger = RichTextDataProcessor.#logger;
    const startTimestamp = performance.now();

    const dataDocument = this.#parseData(data);
    const htmlDocument = createHtmlDocument();

    const converter = new RuleBasedHtmlDomConverter(htmlDocument, this.toViewRules);
    const range = dataDocument.createRange();
    range.selectNodeContents(dataDocument.documentElement);
    const dataFragment = range.extractContents();
    const converted = converter.convert(dataFragment);

    if (converted) {
      htmlDocument.body.append(converted);
    }

    const { innerHTML } = htmlDocument.body;

    // Workaround for CoreMedia/ckeditor-plugins#40: Remove wrong closing tags
    // for singleton elements such as `<img>` and `<br>`. A better fix would
    // fix the serialization issue instead.
    // For now, we just remove (in HTML) obsolete dangling closing tag
    // for the affected elements.
    // TODO: Validate, if still required.
    const dataView = innerHTML.replaceAll(/<\/(?:img|br)>/g, "");

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
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface RichTextDataProcessor extends Observable {}

mix(RichTextDataProcessor, ObservableMixin);

export default RichTextDataProcessor;
