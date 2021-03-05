import ViewDocument from "@ckeditor/ckeditor5-engine/src/view/document";
import ViewDocumentFragment from "@ckeditor/ckeditor5-engine/src/view/documentfragment";
import HtmlDataProcessor from "@ckeditor/ckeditor5-engine/src/dataprocessor/htmldataprocessor";
import DataProcessor from "@ckeditor/ckeditor5-engine/src/dataprocessor/dataprocessor";
import { MatcherPattern } from "@ckeditor/ckeditor5-engine/src/view/matcher";
import Logger from "@coremedia/coremedia-utils/logging/Logger";
import LoggerProvider from "@coremedia/coremedia-utils/logging/LoggerProvider";
import DomConverter from "@ckeditor/ckeditor5-engine/src/view/domconverter";
import RichTextXmlWriter from "./RichTextXmlWriter";
import HtmlFilter from "@coremedia/ckeditor5-dataprocessor-support/dataprocessor/HtmlFilter";
import RichTextSchema from "./RichTextSchema";
import { COREMEDIA_RICHTEXT_NAMESPACE_URI, COREMEDIA_RICHTEXT_PLUGIN_NAME } from "./Constants";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import { getConfig } from "./CoreMediaRichTextConfig";
import HtmlWriter from "@ckeditor/ckeditor5-engine/src/dataprocessor/htmlwriter";
import BasicHtmlWriter from "@ckeditor/ckeditor5-engine/src/dataprocessor/basichtmlwriter";

export default class RichTextDataProcessor implements DataProcessor {
  private readonly logger: Logger = LoggerProvider.getLogger(COREMEDIA_RICHTEXT_PLUGIN_NAME);
  private readonly _delegate: HtmlDataProcessor;
  private readonly _domConverter: DomConverter;
  private readonly _richTextXmlWriter: RichTextXmlWriter;
  private readonly _htmlWriter: HtmlWriter;

  private readonly _toDataFilter: HtmlFilter;
  private readonly _toViewFilter: HtmlFilter;

  private readonly _richTextSchema: RichTextSchema;

  private readonly _domParser: DOMParser;

  constructor(editor: Editor) {
    const document: ViewDocument = editor.data.viewDocument;

    const {
      schema,
      toData,
      toView
    } = getConfig(editor.config);

    this._delegate = new HtmlDataProcessor(document);
    this._domConverter = new DomConverter(document, { blockFillerMode: "nbsp" });
    this._richTextXmlWriter = new RichTextXmlWriter();
    this._htmlWriter = new BasicHtmlWriter();
    this._domParser = new DOMParser();

    this._richTextSchema = schema;

    this._toDataFilter = new HtmlFilter(toData, editor);
    this._toViewFilter = new HtmlFilter(toView, editor);
  }

  registerRawContentMatcher(pattern: MatcherPattern): void {
    this._delegate.registerRawContentMatcher(pattern);
    this._domConverter.registerRawContentMatcher(pattern);
  }

  get richTextSchema(): RichTextSchema {
    return this._richTextSchema;
  }

  /**
   * Transforms CKEditor HTML to CoreMedia RichText 1.0. Note, that in order
   * to trigger data processor for empty text as well, you have to set the
   * option `trim: 'none'` on `CKEditor.getData()`.
   *
   * @param viewFragment fragment from view model to process
   * @return CoreMedia RichText 1.0 XML as string
   */
  toData(viewFragment: ViewDocumentFragment): string {
    const startTimestamp = performance.now();

    const richTextDocument = RichTextDataProcessor.createCoreMediaRichTextDocument();
    // We use the RichTextDocument at this early stage, so that all created elements
    // already have the required namespace. This eases subsequent processing.
    const domFragment: Node | DocumentFragment = this._domConverter.viewToDom(viewFragment, richTextDocument);
    let fragmentAsStringForDebugging: string = "uninitialized";

    if (this.logger.isDebugEnabled()) {
      fragmentAsStringForDebugging = this.fragmentToString(domFragment);

      this.logger.debug("toData: ViewFragment converted to DOM.", {
        view: viewFragment,
        dom: domFragment,
        domAsString: fragmentAsStringForDebugging,
      });
    }

    richTextDocument.documentElement.appendChild(domFragment);

    const doc = this.toCoreMediaRichTextXml(richTextDocument);
    const xml: string = this._richTextXmlWriter.getXml(doc);

    if (this.logger.isDebugEnabled()) {
      this.logger.debug(`Transformed HTML to RichText within ${performance.now() - startTimestamp} ms:`, {
        in: fragmentAsStringForDebugging,
        out: xml,
      });
    }
    return xml;
  }

  private fragmentToString(domFragment: Node | DocumentFragment): string {
    return Array.from(domFragment.childNodes)
      .map((cn) => (<Element>cn).outerHTML || cn.nodeValue)
      .reduce((result, s) => (result || "") + (s || "")) || "";
  }

  /**
   * Transforms the given document to valid CoreMedia RichText. It is expected,
   * that the document already got created with corresponding namespace.
   *
   * Visible for testing only.
   *
   * @param document the yet unprocessed document
   */
  toCoreMediaRichTextXml(document: Document): Document {
    // TODO[cke] In CKEditor 4 we ALWAYS added the XLINK Namespace, even if no links were contained.
    //   We may require to reintroduce it, possibly by "legacy behavior" configuration option.
    //container.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", XLINK_NAMESPACE);

    this._toDataFilter.applyTo(document.documentElement);
    return document;
  }

  static createCoreMediaRichTextDocument(): Document {
    const doc: Document = document.implementation.createDocument(COREMEDIA_RICHTEXT_NAMESPACE_URI, "div");
    const pi = doc.createProcessingInstruction("xml", 'version="1.0" encoding="utf-8"');
    doc.insertBefore(pi, doc.firstChild);
    return doc;
  }

  toView(data: string): ViewDocumentFragment | null {
    const startTimestamp = performance.now();

    const dataDocument = this._domParser.parseFromString(data, "text/xml");
    this._toViewFilter.applyTo(dataDocument.documentElement);
    const documentFragment = dataDocument.createDocumentFragment();
    const nodes: Node[] = Array.from(dataDocument.documentElement.childNodes);
    documentFragment.append(...nodes);

    const html: string = this._htmlWriter.getHtml(documentFragment);

    if (this.logger.isDebugEnabled()) {
      this.logger.debug(`Transformed RichText to HTML within ${performance.now() - startTimestamp} ms:`, {
        in: data,
        out: html,
      });
    }

    return this._delegate.toView(html);
  }

}
