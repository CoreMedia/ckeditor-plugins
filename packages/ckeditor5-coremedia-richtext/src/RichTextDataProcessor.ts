import ViewDocument from "@ckeditor/ckeditor5-engine/src/view/document";
import ViewDocumentFragment from "@ckeditor/ckeditor5-engine/src/view/documentfragment";
import HtmlDataProcessor from "@ckeditor/ckeditor5-engine/src/dataprocessor/htmldataprocessor";
import DataProcessor from "@ckeditor/ckeditor5-engine/src/dataprocessor/dataprocessor";
import { MatcherPattern } from "@ckeditor/ckeditor5-engine/src/view/matcher";
import html2RichText from "./html2richtext/html2richtext";
import richText2Html from "./richtext2html/richtext2html";
import Logger from "@coremedia/coremedia-utils/logging/Logger";
import LoggerProvider from "@coremedia/coremedia-utils/logging/LoggerProvider";
import CoreMediaRichText from "./CoreMediaRichText";
import DomConverter from "@ckeditor/ckeditor5-engine/src/view/domconverter";
import HtmlWriter from "@ckeditor/ckeditor5-engine/src/dataprocessor/htmlwriter";
import RichTextHtmlWriter from "./RichTextHtmlWriter";
import HtmlFilter, { FilterRuleSet } from "@coremedia/ckeditor5-dataprocessor-support/dataprocessor/HtmlFilter";
import RichTextSchema, { Strictness } from "./RichTextSchema";

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

  private readonly richTextSchema: RichTextSchema = new RichTextSchema(Strictness.STRICT);

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
      $: (element) => {
        if (!this.richTextSchema.isAllowedAtParent(element)) {
          // Element is not allowed in CoreMedia Richtext or at least not attached to the given parent:
          // Remove it and attach its children to the parent.
          element.replaceByChildren = true;
        } else {
          this.richTextSchema.adjustAttributes(element);
        }
      },
      ol: (element) => {
        // Workaround/Fix for CMS-10539 (Error while Saving when deleting in Lists, MSIE11)
        return !(element.children.length === 0 || !element.getFirst("li"));
      },
      ul: (element) => {
        // Workaround/Fix for CMS-10539 (Error while Saving when deleting in Lists, MSIE11)
        return !(element.children.length === 0 || !element.getFirst("li"));
      },
      h1: (element) => {
        element.name = "p";
        element.attributes["class"] = "p--heading-1";
      },
      h2: (element) => {
        element.name = "p";
        element.attributes["class"] = "p--heading-2";
      },
      h3: (element) => {
        element.name = "p";
        element.attributes["class"] = "p--heading-3";
      },
      h4: (element) => {
        element.name = "p";
        element.attributes["class"] = "p--heading-4";
      },
      h5: (element) => {
        element.name = "p";
        element.attributes["class"] = "p--heading-5";
      },
      h6: (element) => {
        element.name = "p";
        element.attributes["class"] = "p--heading-6";
      },
      b: (element) => {
        element.name = "strong";
      },
      i: (element) => {
        element.name = "em";
      },
      u: (element) => {
        element.name = "span";
        element.attributes["class"] = "underline";
      },
      strike: (element) => {
        element.name = "span";
        element.attributes["class"] = "strike";
      },
      th: (element) => {
        element.name = "td";
      },
      span: (element) => {
        if (!element.attributes["class"]) {
          // drop element, but not children
          element.name = "";
        }
      },
      "xdiff:span": (element) => {
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

    const domFragment: Node | DocumentFragment = this.domConverter.viewToDom(viewFragment, document);

    this.logger.debug("toData: ViewFragment converted to DOM.", {
      view: viewFragment,
      dom: domFragment,
    });

    const htmlFilter = new HtmlFilter(this.toDataFilterRules);

    const COREMEDIA_RICHTEXT_NAMESPACE = "http://www.coremedia.com/2003/richtext-1.0";
    const XLINK_NAMESPACE = "http://www.w3.org/1999/xlink";

    const doc: Document = document.implementation.createHTMLDocument();
    const container: HTMLDivElement = doc.createElement("div");
    container.setAttribute("xmlns", COREMEDIA_RICHTEXT_NAMESPACE);
    container.setAttribute("xmlns:xlink", XLINK_NAMESPACE);
    container.appendChild(domFragment);

    htmlFilter.applyTo(container);

    const html: string = this.htmlWriter.getHtml(container);
    this.logger.debug(`Transformed HTML to RichText within ${performance.now() - startTimestamp} ms:`, {
      in: viewFragment,
      out: html,
    });
    return html;
  }

  toView(data: string): ViewDocumentFragment | null {
    const html: string = this.richTextToHtml(data);
    return this.delegate.toView(html);
  }

  private richTextToHtml(data: string): string {
    const startTimestamp = performance.now();
    const html: string = richText2Html(data);
    this.logger.debug("Transformed RichText to HTML:", {
      in: data,
      out: html,
      milliseconds: performance.now() - startTimestamp,
    });
    return html;
  }
}
