import Document from "@ckeditor/ckeditor5-engine/src/view/document";
import DocumentFragment from "@ckeditor/ckeditor5-engine/src/view/documentfragment";
import HtmlDataProcessor from "@ckeditor/ckeditor5-engine/src/dataprocessor/htmldataprocessor";
import DataProcessor from "@ckeditor/ckeditor5-engine/src/dataprocessor/dataprocessor";
import { MatcherPattern } from "@ckeditor/ckeditor5-engine/src/view/matcher";
import html2RichText from "./html2richtext/html2richtext";
import richText2Html from "./richtext2html/richtext2html";
import Logger from "@coremedia/coremedia-utils/dist/logging/Logger";
import LoggerProvider from "@coremedia/coremedia-utils/dist/logging/LoggerProvider";
import CMRichText from "./CMRichText";

export default class CMRichTextDataProcessor implements DataProcessor {
  private readonly logger: Logger = LoggerProvider.getLogger(CMRichText.pluginName);
  private delegate: HtmlDataProcessor;

  constructor(document: Document) {
    this.delegate = new HtmlDataProcessor(document);
  }

  registerRawContentMatcher(pattern: MatcherPattern): void {
    this.delegate.registerRawContentMatcher(pattern);
  }

  toData(fragment: DocumentFragment): unknown {
    const html: unknown = this.delegate.toData(fragment);
    return this.htmlToRichText(html);
  }

  toView(data: unknown): DocumentFragment {
    const html: unknown = this.richTextToHtml(data);
    return this.delegate.toView(html);
  }

  private htmlToRichText(html: unknown): unknown {
    const richText: unknown = html2RichText(html);
    this.logger.debug("Transformed HTML to RichText:", {
      in: html,
      out: richText,
    });
    return richText;
  }

  private richTextToHtml(data: unknown): unknown {
    const html = richText2Html(data);
    this.logger.debug("Transformed RichText to HTML:", {
      in: data,
      out: html,
    });
    return html;
  }
}
