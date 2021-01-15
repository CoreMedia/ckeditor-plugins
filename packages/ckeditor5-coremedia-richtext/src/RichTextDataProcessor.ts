import ViewDocument from "@ckeditor/ckeditor5-engine/src/view/document";
import ViewDocumentFragment from "@ckeditor/ckeditor5-engine/src/view/documentfragment";
import HtmlDataProcessor from "@ckeditor/ckeditor5-engine/src/dataprocessor/htmldataprocessor";
import DataProcessor from "@ckeditor/ckeditor5-engine/src/dataprocessor/dataprocessor";
import { MatcherPattern } from "@ckeditor/ckeditor5-engine/src/view/matcher";
import html2RichText from "./html2richtext/html2richtext";
import richText2Html from "./richtext2html/richtext2html";
import Logger from "@coremedia/coremedia-utils/dist/logging/Logger";
import LoggerProvider from "@coremedia/coremedia-utils/dist/logging/LoggerProvider";
import MutableElement from "@coremedia/ckeditor5-dataprocessor-support/dist/dataprocessor/MutableElement";
import CoreMediaRichText from "./CoreMediaRichText";
import DomConverter from "@ckeditor/ckeditor5-engine/src/view/domconverter";
import HtmlWriter from "@ckeditor/ckeditor5-engine/src/dataprocessor/htmlwriter";
import RichTextHtmlWriter from "./RichTextHtmlWriter";

type ElementFilterFunctionResult = MutableElement | Element | boolean;
type ElementFilterFunction = (el: MutableElement) => ElementFilterFunctionResult;
type TextFilterFunctionResult = Text | string | boolean;
type TextFilterFunction = (text: string | null, textNode: Text) => TextFilterFunctionResult;

interface FilterRuleSet {
  elements?: { [key: string]: ElementFilterFunction };
  text?: TextFilterFunction;
}

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
      h2: function (el: MutableElement): ElementFilterFunctionResult {
        return false;
      },
      a: function (el: MutableElement): ElementFilterFunctionResult {
        const attributes = el.attributes;

        attributes["style"] = "great";
        delete attributes["href"];

        // TODO[cke] Do we want to enforce return value? Would be different to
        //  original behavior. Possibly have return type void as alternative?
        return el;
      },
    },
    text: function (text: string | null, textNode: Text): TextFilterFunctionResult {
      return false;
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

    const nodeIterator: NodeIterator = document.createNodeIterator(
      domFragment,
      NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT
    );

    let currentNode: Node | null;
    while ((currentNode = nodeIterator.nextNode())) {
      console.log("currentNode", currentNode);
      if (currentNode instanceof Element && this.toDataFilterRules.elements) {
        const filterRule: ElementFilterFunction = this.toDataFilterRules.elements[currentNode.nodeName.toLowerCase()];
        if (!!filterRule) {
          const result: ElementFilterFunctionResult = filterRule(new MutableElement(currentNode));
          if (!result) {
            const parentNode: (Node & ParentNode) | null = currentNode.parentNode;
            if (!!parentNode) {
              parentNode.removeChild(currentNode);
            }
          } else {
            if (result instanceof Element) {
              const parentNode: (Node & ParentNode) | null = currentNode.parentNode;
              if (!!parentNode) {
                parentNode.insertBefore(result, currentNode);
                parentNode.removeChild(currentNode);
              }
            } else if (result instanceof MutableElement) {
              result.persist();
            }
          }
        }
      } else if (currentNode instanceof Text && this.toDataFilterRules.text) {
        const filterRule: TextFilterFunction = this.toDataFilterRules.text;
        const result: TextFilterFunctionResult = filterRule(currentNode.textContent, currentNode);
        if (result === false) {
          const parentNode: (Node & ParentNode) | null = currentNode.parentNode;
          if (!!parentNode) {
            parentNode.removeChild(currentNode);
          }
        }
      }
    }

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
