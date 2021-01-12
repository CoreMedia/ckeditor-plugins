import Document from "@ckeditor/ckeditor5-engine/src/view/document";
import DocumentFragment from "@ckeditor/ckeditor5-engine/src/view/documentfragment";
import HtmlDataProcessor from "@ckeditor/ckeditor5-engine/src/dataprocessor/htmldataprocessor";
import DataProcessor from "@ckeditor/ckeditor5-engine/src/dataprocessor/dataprocessor";
import { MatcherPattern } from "@ckeditor/ckeditor5-engine/src/view/matcher";
import html2RichText from "./html2richtext/html2richtext";
import richText2Html from "./richtext2html/richtext2html";
import Logger from "@coremedia/coremedia-utils/dist/logging/Logger";
import LoggerProvider from "@coremedia/coremedia-utils/dist/logging/LoggerProvider";
import CoreMediaRichText from "./CoreMediaRichText";
import Node from "@ckeditor/ckeditor5-engine/src/view/node";
import DomConverter from "@ckeditor/ckeditor5-engine/src/view/domconverter";
import HtmlWriter from "@ckeditor/ckeditor5-engine/src/dataprocessor/htmlwriter";
import RichTextHtmlWriter from "./RichTextHtmlWriter";

export default class RichTextDataProcessor implements DataProcessor {
  private readonly logger: Logger = LoggerProvider.getLogger(CoreMediaRichText.pluginName);
  private readonly delegate: HtmlDataProcessor;
  private readonly domConverter: DomConverter;
  private readonly htmlWriter: HtmlWriter;
  /*
   * Todo:
   *   How to stream document-fragments?
   *   What is the input type?
   *   Possibly look-up filter-behavior by CKEditor 4. I think, <null> as return value is meant to delete this node.
   */

  // private readonly toDataFilterRules : Map<string, (k:string) => string|null>;

  constructor(document: Document) {
    this.delegate = new HtmlDataProcessor(document);
    this.domConverter = new DomConverter(document, { blockFillerMode: "nbsp" });
    this.htmlWriter = new RichTextHtmlWriter();
  }

  registerRawContentMatcher(pattern: MatcherPattern): void {
    this.delegate.registerRawContentMatcher(pattern);
    this.domConverter.registerRawContentMatcher(pattern);
  }

  toData(viewFragment: DocumentFragment): string {
    const domFragment: Node | DocumentFragment = this.domConverter.viewToDom(viewFragment, document);
    this.logger.debug("toData: ViewFragment converted to DOM.", {
      view: viewFragment,
      dom: domFragment,
    });
    const html: string = this.htmlWriter.getHtml(domFragment);
    return this.htmlToRichText(html);
  }

  toView(data: string): Node | DocumentFragment | null {
    const html: string = this.richTextToHtml(data);
    return this.delegate.toView(html);
  }

  private htmlToRichText(html: string): string {
    const richText: string = html2RichText(html);
    this.logger.debug("Transformed HTML to RichText:", {
      in: html,
      out: richText,
    });
    return richText;
  }

  private richTextToHtml(data: string): string {
    const html: string = richText2Html(data);
    this.logger.debug("Transformed RichText to HTML:", {
      in: data,
      out: html,
    });
    return html;
  }
}
