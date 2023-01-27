import { SanitationListener } from "../../src/sanitation/SanitationListener";
import { AttributeCause, ElementCause } from "../../src/sanitation/Causes";

/**
 * An artificial listener providing some details to validate in tests.
 */
export class TestSanitationListener extends SanitationListener {
  readonly fatals: string[] = [];
  readonly removedNodes: string[] = [];
  readonly removedInvalidAttrs: string[] = [];

  clear(): void {
    this.fatals.length = 0;
    this.removedNodes.length = 0;
    this.removedInvalidAttrs.length = 0;
  }

  get totalLength(): number {
    return this.fatals.length + this.removedNodes.length + this.removedInvalidAttrs.length;
  }

  get empty(): boolean {
    return this.totalLength === 0;
  }

  fatal(...data: unknown[]): void {
    this.fatals.push(data.join("|"));
  }

  removeNode(node: Node, cause: ElementCause): void {
    this.removedNodes.push(`${node.nodeName}|${cause}`);
  }

  removeInvalidAttr(attributeOwner: Element, attr: Attr, cause: AttributeCause): void {
    this.removedInvalidAttrs.push(`${attributeOwner.nodeName}.${attr.localName}|${cause}`);
  }
}

export const sanitationListener = new TestSanitationListener();

export type ListenerExpectations = (listener: TestSanitationListener) => void;

export const expectNoIssues: ListenerExpectations = (listener: TestSanitationListener): void => {
  expect(listener.empty).toBeTruthy();
};
