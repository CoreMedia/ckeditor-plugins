import Node from "./node"
import Item from "./item";

export default class Element extends Node {
  getStyle(styleName: string): string;
  hasStyle(styleName: string): boolean;
  _removeStyle(styleName: string): void;
  getChildren(): Iterable<Node>;
  getChildIndex(node: Node): number;
  _insertChild(index: number, items: Item | Iterable<Item>): number;
  _removeChildren(index: number, howMany:number): void;
}
