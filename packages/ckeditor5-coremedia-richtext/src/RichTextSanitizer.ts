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
        listener.removeNode(element, "mustNotBeEmpty");
        element.remove();
      } catch (e) {
        listener.fatal(`Failed removing invalid ${element.nodeName}: ${e}`, e);
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
        listener.removeNode(child, "invalidAtParent");
        if (children.hasChildNodes()) {
          parent.replaceChild(children, child);
          // Structure changed, we may need to re-evaluate
          return true;
        }
        parent.removeChild(child);
      } catch (e) {
        listener.fatal(`Failed removing invalid child ${child.nodeName} at ${parent.nodeName}: ${e}`, e);
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

export const causes = ["invalid", "invalidAtParent", "mustNotBeEmpty"];
export type Cause = typeof causes[number];
export const severeCauses: Exclude<Cause, "mustNotBeEmpty">[] = ["invalid", "invalidAtParent"];

export class SanitationListener {
  started(): void {}

  stopped(): void {}

  fatal(...data: unknown[]): void {}

  enteringElement(element: Element, depth: number): void {}

  leavingElement(element: Element, depth: number): void {}

  removeNode(node: Node, cause: Cause): void {}
}

type ConsoleLike = Pick<Console, "debug" | "info" | "warn" | "error" | "group" | "groupEnd">;

class ConsoleSanitationListener extends SanitationListener {
  readonly #console: ConsoleLike;
  #started: DOMHighResTimeStamp = performance.now();

  constructor(con: ConsoleLike = console) {
    super();
    this.#console = con;
  }

  started() {
    this.#started = performance.now();
    this.#console.group("Sanitation started.");
  }

  stopped() {
    const stopped = performance.now();
    this.#console.info(`Sanitation done within ${stopped - this.#started} ms.`);
    this.#console.groupEnd();
  }

  fatal(...data: unknown[]) {
    this.#console.error(data);
  }

  enteringElement(element: Element, depth: number) {
    this.#console.group(`Entering <${element.localName}> at depth ${depth}`);
  }

  leavingElement() {
    this.#console.groupEnd();
  }

  removeNode(node: Node, cause: Cause): void {
    const log = severeCauses.includes(cause) ? this.#console.warn : this.#console.debug;
    log(`Removing ${node.nodeName} (${node.nodeType}): ${cause}`);
  }
}

export class TrackingState {
  removed: {
    total: number;
    severe: number;
  } = { total: 0, severe: 0 };
  visitedElements = 0;
  maxElementDepth = 0;
  startTimeStamp: DOMHighResTimeStamp = performance.now();
  endTimeStamp: DOMHighResTimeStamp = this.startTimeStamp;

  toString(): string {
    const { removed, visitedElements, maxElementDepth, startTimeStamp, endTimeStamp } = this;
    const durationMillis = endTimeStamp - startTimeStamp;
    return `Visited Elements: ${visitedElements}; Removed: ${removed.severe} severe of ${removed.total} total; Maximum Element Depth: ${maxElementDepth}; Duration (ms): ${durationMillis}`;
  }
}

export class TrackingSanitationListener extends SanitationListener {
  #state: TrackingState = new TrackingState();

  started() {
    this.#state = new TrackingState();
  }

  stopped() {
    this.#state.endTimeStamp = performance.now();
  }

  enteringElement(element: Element, depth: number) {
    this.#state.visitedElements++;
    this.#state.maxElementDepth = Math.max(this.#state.maxElementDepth, depth);
  }

  removeNode(node: Node, cause: Cause) {
    this.#state.removed.total++;
    if (severeCauses.includes(cause)) {
      this.#state.removed.severe++;
    }
  }

  get state(): TrackingState {
    return this.#state;
  }
}

export const silentSanitationListener = new SanitationListener();

export const consoleSanitationListener: SanitationListener = new ConsoleSanitationListener();

export const trackingSanitationListener = new TrackingSanitationListener();

export class RichTextSanitizer {
  constructor(
    public readonly strictness: Strictness = Strictness.STRICT,
    public readonly listener = silentSanitationListener
  ) {}

  sanitize<T extends Document>(document: T): T | false {
    this.listener.started();
    const { documentElement } = document;
    let result: T | false = document;
    if (documentElement.localName !== "div") {
      this.listener.fatal(`Invalid document element. Expected: <div>, Action: <${documentElement.localName}>`);
      result = false;
    } else {
      try {
        this.#sanitize(documentElement);
      } catch (e) {
        this.listener.fatal(`Sanitation failed with error: ${e}`, e);
        result = false;
      }
    }
    this.listener.stopped();
    return result;
  }

  #sanitize(element: Element, depth = 0): void {
    this.listener.enteringElement(element, depth);
    if (isParentNode(element)) {
      for (const childElement of element.children) {
        this.#sanitize(childElement, depth + 1);
      }
    }
    const { listener } = this;
    const { localName } = element;
    // If this element is not supported, it is expected to be cleaned up
    // when the parent node calls `removeInvalidChildren`.
    supportedElements[localName]?.removeInvalidChildren(element, listener).removeIfInvalid(element, listener);
    this.listener.leavingElement(element, depth);
  }
}
