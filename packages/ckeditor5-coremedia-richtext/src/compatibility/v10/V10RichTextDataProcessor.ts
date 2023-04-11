import {
  ViewDocument,
  ViewDocumentFragment,
  HtmlDataProcessor,
  DataProcessor,
  DomConverter,
} from "@ckeditor/ckeditor5-engine";
import { MatcherPattern } from "@ckeditor/ckeditor5-engine/src/view/matcher";
import Logger from "@coremedia/ckeditor5-logging/logging/Logger";
import LoggerProvider from "@coremedia/ckeditor5-logging/logging/LoggerProvider";
import RichTextXmlWriter from "../../RichTextXmlWriter";
import HtmlFilter from "@coremedia/ckeditor5-dataprocessor-support/HtmlFilter";
import RichTextSchema from "./RichTextSchema";
import { COREMEDIA_RICHTEXT_PLUGIN_NAME } from "../../Constants";
import { Editor } from "@ckeditor/ckeditor5-core";
import { getConfig } from "./V10CoreMediaRichTextConfig";
import HtmlWriter from "@ckeditor/ckeditor5-engine/src/dataprocessor/htmlwriter";
import BasicHtmlWriter from "@ckeditor/ckeditor5-engine/src/dataprocessor/basichtmlwriter";
import ToDataProcessor from "../../ToDataProcessor";
import { ObservableMixin } from "@ckeditor/ckeditor5-utils";
import { declareCoreMediaRichText10Entities } from "../../Entities";

/**
 * Data-Processor for CoreMedia RichText 1.0.
 */
export default class V10RichTextDataProcessor extends ObservableMixin() implements DataProcessor {
  static readonly #logger: Logger = LoggerProvider.getLogger(COREMEDIA_RICHTEXT_PLUGIN_NAME);
  static readonly #PARSER_ERROR_NAMESPACE = "http://www.w3.org/1999/xhtml";
  readonly #delegate: HtmlDataProcessor;
  readonly #domConverter: DomConverter;
  readonly #richTextXmlWriter: RichTextXmlWriter;
  readonly #htmlWriter: HtmlWriter;

  readonly #toDataProcessor: ToDataProcessor;
  readonly #toViewFilter: HtmlFilter;

  readonly #richTextSchema: RichTextSchema;

  readonly #domParser: DOMParser;
  readonly #noParserErrorNamespace: boolean;

  constructor(editor: Editor) {
    super();

    const document: ViewDocument = editor.data.viewDocument;

    const { schema, toData, toView } = getConfig(editor.config);

    this.#delegate = new HtmlDataProcessor(document);
    // renderingMode: "data" - Fixes observed issue ckeditor/ckeditor5#11786
    this.#domConverter = new DomConverter(document, { renderingMode: "data" });
    this.#richTextXmlWriter = new RichTextXmlWriter();
    this.#htmlWriter = new BasicHtmlWriter();
    this.#domParser = new DOMParser();

    this.#richTextSchema = schema;

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
    // `pre` element. But for TypeScript migration, CKEditor replaced typing
    // by `string[]` instead.
    this.#delegate.domConverter.preElements.push("xdiff:span");

    /*
     * DevNote: Some idea, if we would want to provide a programmatic
     * extension point here, i.e., allow plugins to further extend data-processing
     * rules (like for xdiff:span in Differencing Plugin):
     *
     * + These two instances should be instantiated lazily.
     * + As further late configuration is unlikely, a pattern like "if unset,
     *   instantiate and remember" should do the trick.
     * + The method, which then extends the configuration, should just reset
     *   these variables to `undefined`, so that they will be reevaluated on next
     *   access.
     * + Ideally, such an extension point accepts `FilterRuleSetConfiguration`
     *   as input. This again requires some parsing and some merging algorithm
     *   with existing parsed and pre-processed rules.
     */
    this.#toViewFilter = new HtmlFilter(toView, editor);
    this.#toDataProcessor = new ToDataProcessor(new HtmlFilter(toData, editor));

    const parserErrorDocument = this.#domParser.parseFromString("<", "text/xml");
    this.#noParserErrorNamespace =
      V10RichTextDataProcessor.#PARSER_ERROR_NAMESPACE !==
      parserErrorDocument.getElementsByTagName("parsererror")[0].namespaceURI;
  }

  registerRawContentMatcher(pattern: MatcherPattern): void {
    this.#delegate.registerRawContentMatcher(pattern);
    this.#domConverter.registerRawContentMatcher(pattern);
  }

  useFillerType(type: "default" | "marked"): void {
    this.#domConverter.blockFillerMode = type === "marked" ? "markedNbsp" : "nbsp";
  }

  /**
   * Exposes the richtext schema indirectly to the filters. It will be accessed
   * via the data processor property of the editor.
   */
  get richTextSchema(): RichTextSchema {
    // For testing purpose: CoreMediaRichTextConfig contains a fallback, which
    // is to use the RichTextSchema with Strict mode. This should be enough
    // for testing, so that it should not be necessary to mock this call during
    // tests.
    return this.#richTextSchema;
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
    const logger = V10RichTextDataProcessor.#logger;
    const startTimestamp = performance.now();

    const { richTextDocument, domFragment, fragmentAsStringForDebugging } = this.initToData(viewFragment);
    const xml = this.toDataInternal(domFragment, richTextDocument);
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
   * @returns `richTextDocument` the (empty) document, which shall receive the transformed data;
   * `domFragment` the view DOM-structure to transform;
   * `fragmentAsStringForDebugging` some representation of `domFragment` to be used for debugging — it will only
   * be initialized, if debug logging is turned on.
   */
  initToData(viewFragment: ViewDocumentFragment): {
    richTextDocument: Document;
    domFragment: Node | DocumentFragment;
    fragmentAsStringForDebugging: string;
  } {
    const richTextDocument = ToDataProcessor.createCoreMediaRichTextDocument();
    const domFragment: Node | DocumentFragment = this.#domConverter.viewToDom(viewFragment);
    let fragmentAsStringForDebugging = "uninitialized";

    if (V10RichTextDataProcessor.#logger.isDebugEnabled()) {
      fragmentAsStringForDebugging = this.#fragmentToString(domFragment);

      V10RichTextDataProcessor.#logger.debug("toData: ViewFragment converted to DOM.", {
        view: viewFragment,
        dom: domFragment,
        domAsString: fragmentAsStringForDebugging,
      });
    }
    return {
      richTextDocument,
      domFragment,
      fragmentAsStringForDebugging,
    };
  }

  /**
   * Internal `toData` transformation, especially meant for testing purpose.
   *
   * @param fromView - the fragment created from view
   * @param targetDocument - the target document, which will get the elements added
   * and will be transformed according to the rules
   * @returns the transformed CoreMedia RichText XML
   */
  toDataInternal(fromView: Node | DocumentFragment, targetDocument?: Document): string {
    const dataDocument = this.#toDataProcessor.toData(fromView, targetDocument);
    return this.#richTextXmlWriter.getXml(dataDocument);
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
    const namespace = V10RichTextDataProcessor.#PARSER_ERROR_NAMESPACE;
    if (this.#noParserErrorNamespace) {
      // In PhantomJS the parseerror element doesn't seem to have a special namespace, so we are just guessing here :(
      return parsedDocument.getElementsByTagName("parsererror").length > 0;
    }

    return parsedDocument.getElementsByTagNameNS(namespace, "parsererror").length > 0;
  }

  toView(data: string): ViewDocumentFragment {
    const logger = V10RichTextDataProcessor.#logger;
    const startTimestamp = performance.now();

    let dataView = "";

    // If data are empty, we expect empty RichText by default, thus, we don't
    // need any parsing but may directly forward the empty data to the delegate
    // `toView` handler.
    if (data) {
      const dataDocument = this.#domParser.parseFromString(declareCoreMediaRichText10Entities(data), "text/xml");
      if (this.#isParserError(dataDocument)) {
        logger.error("Failed parsing data. See debug messages for details.", { data });
        if (logger.isDebugEnabled()) {
          // noinspection InnerHTMLJS
          const parsererror = dataDocument.documentElement.innerHTML;
          logger.debug("Failed parsing data.", { parsererror });
        }
      } else {
        // Only apply filters, if we received valid data.
        this.#toViewFilter.applyTo(dataDocument.documentElement);
      }

      const documentFragment = dataDocument.createDocumentFragment();
      const nodes: Node[] = Array.from(dataDocument.documentElement.childNodes);
      documentFragment.append(...nodes);

      const html: string = this.#htmlWriter.getHtml(documentFragment);

      // Workaround for CoreMedia/ckeditor-plugins#40: Remove wrong closing tags
      // for singleton elements such as `<img>` and `<br>`. A better fix would
      // fix the serialization issue instead.
      // For now, we just remove (in HTML) obsolete dangling closing tag
      // for the affected elements.
      dataView = html.replaceAll(/<\/(?:img|br)>/g, "");
    }

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
