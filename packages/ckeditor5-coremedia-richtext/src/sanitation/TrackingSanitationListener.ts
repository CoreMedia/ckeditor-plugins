import { isHasNamespaceUri } from "@coremedia/ckeditor5-dom-support";
import type { AttributeCause, ElementCause } from "./Causes";
import { severeElementCauses } from "./Causes";
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
export type TrackingSanitationListenerConsole = Pick<Console, "debug" | "info" | "warn" | "error">;

/**
 * The tracking sanitation listener listens to sanitation events and especially
 * provides some statistics, which may help to optimize sanitation. Its main
 * purpose though is to report visible on possible misconfiguration, that needs
 * to be adapted. That is why in some events, the final statistics are logged
 * with a warning.
 */
export class TrackingSanitationListener extends SanitationListener {
  #state: TrackingState = new TrackingState();
  readonly #console: TrackingSanitationListenerConsole;

  constructor(con: TrackingSanitationListenerConsole = console) {
    super();
    this.#console = con;
  }

  override started() {
    this.#state = new TrackingState();
  }

  override stopped() {
    this.#state.endTimeStamp = performance.now();
    if (this.#state.hasSevereIssues()) {
      this.#console.warn(`Sanitation done with issues (turn on debug logging for details): ${this.#state}`);
    } else {
      this.#console.debug(`Sanitation done: ${this.#state}`);
    }
  }

  override fatal(...data: unknown[]) {
    this.#console.error(data);
  }

  override enteringElement(element: Element, depth: number) {
    this.#state.visitedElements++;
    this.#state.maxElementDepth = Math.max(this.#state.maxElementDepth, depth);
  }

  override removeNode(node: Node, cause: ElementCause) {
    this.#state.removedElements.total++;
    if (severeElementCauses.includes(cause)) {
      this.#state.removedElements.severe++;
      const { nodeName, nodeType, parentNode } = node;
      this.#console.debug(`Removing ${nodeName} (type: ${nodeType}, parent: ${parentNode?.nodeName}): ${cause}`, {
        node: {
          nodeName,
          nodeType,
          namespaceURI: isHasNamespaceUri(node) ? node.namespaceURI : undefined,
        },
        parentNode: {
          nodeName: parentNode?.nodeName,
          nodeType: parentNode?.nodeType,
          namespaceURI: isHasNamespaceUri(parentNode) ? parentNode.namespaceURI : undefined,
        },
      });
    }
  }

  override removeInvalidAttr(attributeOwner: Element, attr: Attr, cause: AttributeCause) {
    this.#console.debug(
      `Removing invalid attribute ${attr.localName} at ${attributeOwner.localName} (value: "${attr.value}"): ${cause}`,
    );
    this.#state.removedInvalidAttrs++;
  }
}
