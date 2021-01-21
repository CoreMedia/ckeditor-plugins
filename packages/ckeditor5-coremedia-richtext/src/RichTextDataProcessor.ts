import ViewDocument from "@ckeditor/ckeditor5-engine/src/view/document";
import ViewDocumentFragment from "@ckeditor/ckeditor5-engine/src/view/documentfragment";
import HtmlDataProcessor from "@ckeditor/ckeditor5-engine/src/dataprocessor/htmldataprocessor";
import DataProcessor from "@ckeditor/ckeditor5-engine/src/dataprocessor/dataprocessor";
import { MatcherPattern } from "@ckeditor/ckeditor5-engine/src/view/matcher";
import html2RichText from "./html2richtext/html2richtext";
import richText2Html from "./richtext2html/richtext2html";
import Logger from "@coremedia/coremedia-utils/src/logging/Logger";
import LoggerProvider from "@coremedia/coremedia-utils/src/logging/LoggerProvider";
import CoreMediaRichText from "./CoreMediaRichText";
import DomConverter from "@ckeditor/ckeditor5-engine/src/view/domconverter";
import HtmlWriter from "@ckeditor/ckeditor5-engine/src/dataprocessor/htmlwriter";
import RichTextHtmlWriter from "./RichTextHtmlWriter";
import HtmlFilter, { FilterRuleSet } from "@coremedia/ckeditor5-dataprocessor-support/src/dataprocessor/HtmlFilter";

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

  /**
   * Coremedia Richtext Filter, that are applied before writing it back to the server. Some details about filter
   * execution: (see especially <code>core/htmlparser/element.js</code>)
   *
   * <ul>
   * <li>If an element name changes, filtering will be restarted at that node.</li>
   * <li>If a new element is returned, it will replace the current one and processing will be restarted for that node.</li>
   * <li>If false is returned, the element and all its children will be removed.</li>
   * <li>If element name changes to empty, only the element itself will be removed and the children appended to the parent</li>
   * <li>An element is processed first, then its attributes and afterwards its children (if any)</li>
   * <li>Text nodes only support to be changed or removed... but not to be wrapped into some other element.</li>
   * <li><code>$</code> is a so called generic element rule which is applied after element processing.
   * The opposite handler is <code>'^'</code> which would be applied before all other element handlers.</li>
   * </ul>
   */
  private readonly toDataFilterRules: FilterRuleSet = {
    elements: {
      ol: function (element) {
        // Workaround/Fix for CMS-10539 (Error while Saving when deleting in Lists, MSIE11)
        if (element.children.length === 0 || !element.getFirst("li")) {
          return false;
        }
      },
      ul: function (element) {
        // Workaround/Fix for CMS-10539 (Error while Saving when deleting in Lists, MSIE11)
        if (element.children.length === 0 || !element.getFirst("li")) {
          return false;
        }
      },
      h1: function (element) {
        element.name = "p";
        element.attributes["class"] = "p--heading-1";
      },
      h2: function (element) {
        element.name = "p";
        element.attributes["class"] = "p--heading-2";
      },
      h3: function (element) {
        element.name = "p";
        element.attributes["class"] = "p--heading-3";
      },
      h4: function (element) {
        element.name = "p";
        element.attributes["class"] = "p--heading-4";
      },
      h5: function (element) {
        element.name = "p";
        element.attributes["class"] = "p--heading-5";
      },
      h6: function (element) {
        element.name = "p";
        element.attributes["class"] = "p--heading-6";
      },
      b: function (element) {
        element.name = "strong";
      },
      i: function (element) {
        element.name = "em";
      },
      u: function (element) {
        element.name = "span";
        element.attributes["class"] = "underline";
      },
      strike: function (element) {
        element.name = "span";
        element.attributes["class"] = "strike";
      },
      th: function (element) {
        element.name = "td";
      },
      span: function (element) {
        if (!element.attributes["class"]) {
          // drop element, but not children
          element.name = "";
        }
      },
      "xdiff:span": function (element) {
        element.name = "";
      },
    },
  };

  constructor(document: ViewDocument) {
    this.delegate = new HtmlDataProcessor(document);
    this.domConverter = new DomConverter(document, { blockFillerMode: "nbsp" });
    this.htmlWriter = new RichTextHtmlWriter();
  }

  registerRawContentMatcher(pattern: MatcherPattern): void {
    this.delegate.registerRawContentMatcher(pattern);
    this.domConverter.registerRawContentMatcher(pattern);
  }

  toData(viewFragment: ViewDocumentFragment): string {
    const domFragment: Node | DocumentFragment = this.domConverter.viewToDom(viewFragment, document);

    this.logger.debug("toData: ViewFragment converted to DOM.", {
      view: viewFragment,
      dom: domFragment,
    });

    const htmlFilter = new HtmlFilter(this.toDataFilterRules);
    htmlFilter.applyTo(domFragment);

    const html: string = this.htmlWriter.getHtml(domFragment);
    return this.htmlToRichText(html);
  }

  toView(data: string): ViewDocumentFragment | null {
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
