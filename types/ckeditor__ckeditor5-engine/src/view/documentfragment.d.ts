import Node from "./node"
import Item from "./item";

export default class DocumentFragment {
  readonly document: Document;

  getChildren(): Iterable<Node>;

  _insertChild(index: number, items: Item | Iterable<Item>): number;
  _removeChildren(index: number, howMany:number): void;

  getChildIndex(node:  Node): number;
}
