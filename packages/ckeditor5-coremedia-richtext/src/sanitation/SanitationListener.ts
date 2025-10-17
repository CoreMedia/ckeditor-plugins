import type { AttributeCause, ElementCause } from "./Causes";

export class SanitationListener {
  started(): void {}

  stopped(): void {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  fatal(...data: unknown[]): void {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  enteringElement(element: Element, depth: number): void {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  leavingElement(element: Element, depth: number): void {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  removeNode(node: Node, cause: ElementCause): void {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  removeInvalidAttr(attributeOwner: Element, attr: Attr, cause: AttributeCause): void {}
}

export const silentSanitationListener = new SanitationListener();
