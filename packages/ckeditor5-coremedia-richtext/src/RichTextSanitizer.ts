import { Strictness } from "./Strictness";
import { isCharacterData } from "@coremedia/ckeditor5-dom-support/CharacterDatas";
import { isElement } from "@coremedia/ckeditor5-dom-support/Elements";
import { isParentNode } from "@coremedia/ckeditor5-dom-support/ParentNodes";
import { COREMEDIA_RICHTEXT_NAMESPACE_URI } from "./Constants";

const pcdata = Symbol("pcdata");
const allowEmpty = Symbol("allowEmpty");

type ElementContent = string | typeof pcdata | typeof allowEmpty;

const special: ElementContent[] = ["br", "span", "img"];
const phrase: ElementContent[] = ["em", "strong", "sub", "sup"];
const inline: ElementContent[] = ["a", ...special, ...phrase];
const Inline: ElementContent[] = [allowEmpty, pcdata, ...inline];
const lists: ElementContent[] = ["ul", "ol"];
const blocktext: ElementContent[] = ["pre", "blockquote"];
const block: ElementContent[] = ["p", ...lists, ...blocktext, "table"];
const Block: ElementContent[] = [allowEmpty, ...block];
const Flow: ElementContent[] = [allowEmpty, pcdata, ...block, ...inline];
const aContent: ElementContent[] = [allowEmpty, pcdata, ...special, ...phrase];
const preContent: ElementContent[] = [allowEmpty, pcdata, "a", "br", "span", ...phrase];

class ElementConfig {
  constructor(public allowed: ElementContent[] = []) {}

  isValidChild(node: ChildNode): boolean {
    const { allowed } = this;
    if (isCharacterData(node)) {
      return allowed.includes(pcdata);
    }
    if (isElement(node)) {
      // TODO: Perhaps better place, but we need to respect the namespace.
      if (node.namespaceURI !== COREMEDIA_RICHTEXT_NAMESPACE_URI) {
        return false;
      }
      return allowed.includes(node.localName);
    }
    return false;
  }

  isInvalidChild(node: ChildNode): boolean {
    return !this.isValidChild(node);
  }

  removeInvalidChildren(node: ParentNode, listener: SanitationListener): this {
    let possiblyDirty = true;
    while (possiblyDirty) {
      possiblyDirty = [...node.childNodes]
        .map((childNode) => this.#removeInvalidChild(node, childNode, listener))
        .reduce((previous, current) => previous || current, false);
    }
    return this;
  }

  removeIfInvalid(element: Element, listener: SanitationListener): this {
    const { allowed } = this;
    // allowed.length => implicit declaration of "allowEmpty"
    const mayBeEmpty = allowed.length === 0 || allowed.includes(allowEmpty);
    if (!element.hasChildNodes() && !mayBeEmpty) {
      try {
        element.remove();
        listener.onRemoveEmpty(element);
      } catch (e) {
        console.error(`Failed removing invalid <${element.nodeName}>: ${e}`, e);
      }
    }
    return this;
  }

  #removeInvalidChild(parent: ParentNode, child: ChildNode, listener: SanitationListener): boolean {
    if (this.isInvalidChild(child)) {
      try {
        const { ownerDocument } = parent;
        const range = ownerDocument?.createRange() ?? new Range();
        range.selectNodeContents(child);
        const children = range.extractContents();
        if (children.hasChildNodes()) {
          listener.onRemoveInvalidChild(parent, child, "replaceByChildren");
          parent.replaceChild(children, child);
          // Structure changed, we may need to re-evaluate
          return true;
        }
        listener.onRemoveInvalidChild(parent, child, "remove");
        parent.removeChild(child);
      } catch (e) {
        console.error(`Failed removing invalid child <${child.nodeName}> at <${parent.nodeName}>: ${e}`, e);
      }
    }
    return false;
  }
}

export const richTextElementNames = [
  "div",
  "p",
  "ul",
  "ol",
  "li",
  "pre",
  "blockquote",
  "a",
  "span",
  "br",
  "em",
  "strong",
  "sub",
  "sup",
  "img",
  "table",
  "tbody",
  "tr",
  "td",
];
export type RichTextElementName = typeof richTextElementNames[number];
export type SupportedRichTextElements = Record<RichTextElementName, ElementConfig>;

const supportedElements: SupportedRichTextElements = {
  div: new ElementConfig(Block),
  p: new ElementConfig(Inline),
  ul: new ElementConfig(["li"]),
  ol: new ElementConfig(["li"]),
  li: new ElementConfig(Flow),
  pre: new ElementConfig(preContent),
  blockquote: new ElementConfig(Block),
  a: new ElementConfig(aContent),
  span: new ElementConfig(Inline),
  br: new ElementConfig(),
  em: new ElementConfig(Inline),
  strong: new ElementConfig(Inline),
  sub: new ElementConfig(Inline),
  sup: new ElementConfig(Inline),
  img: new ElementConfig(),
  table: new ElementConfig(["tbody", "tr"]),
  tbody: new ElementConfig(["tr"]),
  tr: new ElementConfig(["td"]),
  td: new ElementConfig(Flow),
};

export interface SanitationListener {
  onRemoveInvalidChild(parent: ParentNode, child: ChildNode, strategy: "remove" | "replaceByChildren"): void;
  onRemoveEmpty(parent: ParentNode): void;
}

export const silentSanitationListener: SanitationListener = {
  onRemoveInvalidChild(): void {},
  onRemoveEmpty(): void {},
};

export const consoleSanitationListener: SanitationListener = {
  onRemoveInvalidChild(parent: ParentNode, child: ChildNode, strategy) {
    console.warn(`Removing invalid child <${child.nodeName}> at <${parent.nodeName}> by strategy '${strategy}'.`);
  },
  onRemoveEmpty(parent: ParentNode): void {
    console.warn(`Removing <${parent.nodeName}> because it is empty.`);
  },
};

export class RichTextSanitizer {
  constructor(
    public readonly strictness: Strictness = Strictness.STRICT,
    public readonly listener = silentSanitationListener
  ) {}

  sanitize<T extends Document>(document: T): T | false {
    const { documentElement } = document;
    if (documentElement.localName !== "div") {
      // The overall document is invalid.
      return false;
    }
    this.#sanitize(documentElement);
    return document;
  }

  #sanitize(element: Element): void {
    if (isParentNode(element)) {
      for (const childElement of element.children) {
        this.#sanitize(childElement);
      }
    }
    const { listener } = this;
    const { localName } = element;
    // If this element is not supported, it is expected to be cleaned up
    // when the parent node calls `removeInvalidChildren`.
    supportedElements[localName]?.removeInvalidChildren(element, listener).removeIfInvalid(element, listener);
  }
}
