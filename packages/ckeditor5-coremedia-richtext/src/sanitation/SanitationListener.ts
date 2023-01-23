import { Cause, severeCauses } from "../Causes";

export class SanitationListener {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  started(): void {}

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  stopped(): void {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/no-empty-function
  fatal(...data: unknown[]): void {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/no-empty-function
  enteringElement(element: Element, depth: number): void {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/no-empty-function
  leavingElement(element: Element, depth: number): void {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/no-empty-function
  removeNode(node: Node, cause: Cause): void {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/no-empty-function
  removeInvalidAttr(attributeOwner: Element, attr: Attr, cause: "invalidAtElement" | "invalidValue"): void {}
}

class TrackingState {
  removed: {
    total: number;
    severe: number;
  } = { total: 0, severe: 0 };
  removedInvalidAttrs = 0;
  visitedElements = 0;
  maxElementDepth = 0;
  startTimeStamp: DOMHighResTimeStamp = performance.now();
  endTimeStamp: DOMHighResTimeStamp = this.startTimeStamp;

  /**
   * Are there any severe issues, that signal, that data-processing is missing
   * any rules for correct mapping?
   */
  hasSevereIssues(): boolean {
    return this.removed.severe + this.removedInvalidAttrs > 0;
  }

  toString(): string {
    const { removed, removedInvalidAttrs, visitedElements, maxElementDepth, startTimeStamp, endTimeStamp } = this;
    const durationMillis = endTimeStamp - startTimeStamp;
    return `Visited Elements: ${visitedElements}; Removed: ${removed.severe} severe of ${removed.total} total; Removed Invalid Attributes: ${removedInvalidAttrs}, Maximum Element Depth: ${maxElementDepth}; Duration (ms): ${durationMillis}`;
  }
}

type TrackingSanitationListenerConsole = Pick<Console, "debug" | "info" | "warn" | "error">;

export class TrackingSanitationListener extends SanitationListener {
  #state: TrackingState = new TrackingState();
  #console: TrackingSanitationListenerConsole;

  constructor(con: TrackingSanitationListenerConsole = console) {
    super();
    this.#console = con;
  }

  started() {
    this.#state = new TrackingState();
  }

  stopped() {
    this.#state.endTimeStamp = performance.now();
    if (this.#state.hasSevereIssues()) {
      this.#console.warn(`Sanitation done with issues (turn on debug logging for details): ${this.#state}`);
    } else {
      this.#console.debug(`Sanitation done: ${this.#state}`);
    }
  }

  fatal(...data: unknown[]) {
    this.#console.error(data);
  }

  enteringElement(element: Element, depth: number) {
    this.#state.visitedElements++;
    this.#state.maxElementDepth = Math.max(this.#state.maxElementDepth, depth);
  }

  removeNode(node: Node, cause: Cause) {
    this.#state.removed.total++;
    if (severeCauses.includes(cause)) {
      this.#state.removed.severe++;
      this.#console.debug(
        `Removing ${node.nodeName} (type: ${node.nodeType}, parent: ${node.parentNode?.nodeName}): ${cause}`
      );
    }
  }

  removeInvalidAttr(attributeOwner: Element, attr: Attr, cause: "invalidAtElement" | "invalidValue") {
    this.#console.debug(`Removing invalid attribute ${attr.localName} at ${attributeOwner.localName} (value: "${attr.value}"): ${cause}`);
    this.#state.removedInvalidAttrs++;
  }
}

export const silentSanitationListener = new SanitationListener();
