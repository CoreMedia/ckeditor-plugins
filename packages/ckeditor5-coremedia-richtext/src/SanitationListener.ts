import { Cause, severeCauses } from "./Causes";

export class SanitationListener {
  started(): void {}

  stopped(): void {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/no-empty-function
  fatal(...data: unknown[]): void {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/no-empty-function
  enteringElement(element: Element, depth: number): void {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/no-empty-function
  leavingElement(element: Element, depth: number): void {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/no-empty-function
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
