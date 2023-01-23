import { AttributeCause, ElementCause, severeElementCauses } from "../Causes";
import { SanitationListener } from "./SanitationListener";

class TrackingState {
  removedElements: {
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
    return this.removedElements.severe + this.removedInvalidAttrs > 0;
  }

  toString(): string {
    const { removedElements, removedInvalidAttrs, visitedElements, maxElementDepth, startTimeStamp, endTimeStamp } =
      this;
    const durationMillis = endTimeStamp - startTimeStamp;
    return `Visited Elements: ${visitedElements}; Removed: ${removedElements.severe} severe of ${removedElements.total} total; Removed Invalid Attributes: ${removedInvalidAttrs}, Maximum Element Depth: ${maxElementDepth}; Duration (ms): ${durationMillis}`;
  }
}

/**
 * Explicitly declares the expected API for logging. Thus, alternative
 * implementations may be handed over.
 */
type TrackingSanitationListenerConsole = Pick<Console, "debug" | "info" | "warn" | "error">;

/**
 * The tracking sanitation listener listens to sanitation events and especially
 * provides some statistics, which may help to optimize sanitation. Its main
 * purpose though is to report visible on possible misconfiguration, that needs
 * to be adapted. That is why on some events the final statistics is logged
 * with a warning.
 */
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

  removeNode(node: Node, cause: ElementCause) {
    this.#state.removedElements.total++;
    if (severeElementCauses.includes(cause)) {
      this.#state.removedElements.severe++;
      this.#console.debug(
        `Removing ${node.nodeName} (type: ${node.nodeType}, parent: ${node.parentNode?.nodeName}): ${cause}`
      );
    }
  }

  removeInvalidAttr(attributeOwner: Element, attr: Attr, cause: AttributeCause) {
    this.#console.debug(
      `Removing invalid attribute ${attr.localName} at ${attributeOwner.localName} (value: "${attr.value}"): ${cause}`
    );
    this.#state.removedInvalidAttrs++;
  }
}