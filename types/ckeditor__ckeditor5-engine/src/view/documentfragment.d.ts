import Node from "./node"
import Item from "./item";

export default class DocumentFragment {
  readonly document: Document;

  // DevNote: Would be correct, but clashes where Element | DocumentFragment is
  // used as return type.
  // [Symbol.iterator](): Iterator<Node>;

  getChildren(): Iterable<Node>;

  _insertChild(index: number, items: Item | Iterable<Item>): number;

  _removeChildren(index: number, howMany: number): void;

  getChildIndex(node: Node): number;
}
