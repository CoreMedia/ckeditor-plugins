import ViewDocument from "@ckeditor/ckeditor5-engine/src/view/document";
import ViewDocumentFragment from "@ckeditor/ckeditor5-engine/src/view/documentfragment";
import HtmlDataProcessor from "@ckeditor/ckeditor5-engine/src/dataprocessor/htmldataprocessor";
import DataProcessor from "@ckeditor/ckeditor5-engine/src/dataprocessor/dataprocessor";
import { MatcherPattern } from "@ckeditor/ckeditor5-engine/src/view/matcher";
import html2RichText from "./html2richtext/html2richtext";
import richText2Html from "./richtext2html/richtext2html";
import Logger from "@coremedia/coremedia-utils/dist/logging/Logger";
import LoggerProvider from "@coremedia/coremedia-utils/dist/logging/LoggerProvider";
import CoreMediaRichText from "./CoreMediaRichText";
import DomConverter from "@ckeditor/ckeditor5-engine/src/view/domconverter";
import HtmlWriter from "@ckeditor/ckeditor5-engine/src/dataprocessor/htmlwriter";
import RichTextHtmlWriter from "./RichTextHtmlWriter";

type AttributeValue = string | null | undefined;

interface Attributes {
  [index: string]: AttributeValue;
}

class MutableElement {
  private readonly _delegate: Element;
  /**
   * If the name is set to empty string, the element itself is removed,
   * but its children added to the element's parent.
   */
  private _name: string | undefined = undefined;
  private _attributes: Attributes = {};

  constructor(delegate: Element) {
    this._delegate = delegate;
  }

  get element(): Element {
    return this._delegate;
  }

  get isReplaceWithChildren(): boolean {
    return this._name === "";
  }

  get isReplace(): boolean {
    if (!this._name) {
      return false;
    }
    return this._name.toLowerCase() !== this._delegate.tagName.toLowerCase();
  }

  get parent(): HTMLElement | null {
    return this._delegate.parentElement;
  }

  get children(): HTMLCollection {
    return this._delegate.children;
  }

  get name(): string {
    return this._name || this._delegate.tagName;
  }

  set name(newName: string) {
    this._name = newName;
  }

  // https://javascript.info/proxy
  // Do we require this, e.g. for custom attributes: https://github.com/ckeditor/ckeditor5/issues/1462
  get attributes(): Attributes {
    const element: Element = this._delegate;
    return new Proxy(this._attributes, {
      defineProperty(target: Attributes, p: PropertyKey, attributes: PropertyDescriptor): boolean {
        console.log("defineProperty", {
          target: target,
          p: p,
          attributes: attributes,
        });
        return Reflect.defineProperty(target, p, attributes);
      },
      get(target: Attributes, p: PropertyKey, receiver: never): AttributeValue {
        console.log("get", {
          target: target,
          p: p,
          receiver: receiver,
        });
        if (Reflect.has(target, p)) {
          return Reflect.get(target, p, receiver);
        }
        if (typeof p === "string") {
          return element.getAttribute(p);
        }
        return undefined;
      },
      getOwnPropertyDescriptor(target: Attributes, p: PropertyKey): PropertyDescriptor | undefined {
        console.log("getOwnPropertyDescriptor", {
          target: target,
          p: p,
        });
        if (Reflect.has(target, p)) {
          const value = Reflect.get(target, p);
          if (value === undefined) {
            return undefined;
          }
          return {
            configurable: true,
            enumerable: true,

            get(): unknown {
              console.log("target.get", {
                p: p,
                value: value,
              });
              return value;
            },

            set(v: unknown): void {
              console.log("target.set", {
                p: p,
                value: v,
              });
              Reflect.set(target, p, v);
            },
          };
        }
        if (typeof p === "string" && element.hasAttribute(p)) {
          return {
            configurable: true,
            enumerable: true,

            get(): string | null {
              console.log("element.get", {
                p: p,
                value: element.getAttribute(p),
              });
              return element.getAttribute(p);
            },

            set(v: unknown): void {
              console.log("element.set", {
                p: p,
                value: v,
              });
              Reflect.set(target, p, v);
            },
          };
        }
        return undefined;
      },
      set(target: Attributes, p: PropertyKey, value: unknown): boolean {
        console.log("set", {
          target: target,
          p: p,
          value: value,
        });
        return Reflect.set(target, p, value);
      },
      deleteProperty(target: Attributes, p: PropertyKey): boolean {
        console.log("deleteProperty", {
          target: target,
          p: p,
        });
        if (typeof p === "string") {
          target[p] = undefined;
          return true;
        }
        return false;
      },
      has(target: Attributes, p: PropertyKey): boolean {
        console.log("has", {
          target: target,
          p: p,
        });
        const targetHas: boolean = Reflect.has(target, p);
        if (targetHas) {
          return Reflect.get(target, p) !== undefined;
        }
        if (typeof p === "string") {
          return element.hasAttribute(p);
        }
        return false;
      },
      ownKeys(target: Attributes): PropertyKey[] {
        console.log("ownKeys", {
          target: target,
        });
        const targetKeys: PropertyKey[] = Reflect.ownKeys(target);
        const elementAttrs: PropertyKey[] = element.getAttributeNames();
        // Join distinct keys, skip forcibly deleted.
        const result: PropertyKey[] = elementAttrs
          .concat(targetKeys.filter((k) => elementAttrs.indexOf(k) < 0))
          .filter((k) => !Reflect.has(target, k) || Reflect.get(target, k) !== undefined);
        console.log("ownKeys", { target: target, keys: result });
        return result;
      },
    });
  }
}

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
        const attributes = el.attributes;

        attributes["style"] = "great";

        const classAttr = attributes["class"];
        const styleAttr = attributes["style"];
        console.log("mutable:", {
          attributes: attributes,
          classAttr: classAttr,
          styleAttr: styleAttr,
        });
        return false;
      },
      a: function (el: MutableElement): ElementFilterFunctionResult {
        const attributes = el.attributes;

        attributes["style"] = "great";
        delete attributes["href"];

        const hrefAttr = attributes["href"];
        const styleAttr = attributes["style"];

        // TODO[cke] Now respect modified attributes and adapt the element...

        console.log("mutable:", {
          attributes: attributes,
          hrefAttr: hrefAttr,
          styleAttr: styleAttr,
        });
        let k: string;
        for (k in attributes) {
          console.log("loop: ", {
            k: k,
            val: attributes[k],
          });
        }
        return true;
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
