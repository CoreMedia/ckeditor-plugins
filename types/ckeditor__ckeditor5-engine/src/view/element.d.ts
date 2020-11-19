import Node from "./node"

export default class Element extends Node {
  getStyle(styleName: string): string;
  hasStyle(styleName: string): boolean;
  _removeStyle(styleName: string): void;
  getChildren(): Iterable<Node>;
}
