import { AttributeCause, ElementCause } from "../Causes";

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
  removeNode(node: Node, cause: ElementCause): void {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/no-empty-function
  removeInvalidAttr(attributeOwner: Element, attr: Attr, cause: AttributeCause): void {}
}

export const silentSanitationListener = new SanitationListener();
