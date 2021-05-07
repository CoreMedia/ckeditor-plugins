import Node from './node';

/**
 * Model element.
 *
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_model_element-Element.html">Class Element (engine/model/element~Element) - CKEditor 5 API docs</a>
 */
export default class Element extends Node {
  get childCount(): number;

  get isEmpty(): boolean;

  get maxOffset(): number;

  get name(): string;

  findAncestor(parentName: string, options?: {
    includeSelf: boolean,
  }): Element | null;

  getChild(index: number): Element | Text;

  getChildIndex(node: Node): number;

  getChildStartOffset(node: Node): number;

  getChildren(): IterableIterator<Element | Text>;

  getNodeByPath(relativePath: number[]): Node;

  is(type: string, name?: string): boolean;

  offsetToIndex(offset: number): number;

  static fromJSON(json: Object): Element;
}
