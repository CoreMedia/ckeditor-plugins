import ViewDocument from "./document"
import ViewNode from "./node"
import { Item } from "./item";

/**
 * View element.
 *
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_view_element-Element.html">Class Element (engine/view/element~Element) - CKEditor 5 API docs</a>
 */
export default class Element extends ViewNode {
  readonly document: ViewDocument;

  /**
   * Returns style value for the given property mae.
   * If the style does not exist `undefined` is returned.
   *
   * @param {String} property
   * @returns {String|undefined}
   */
  getStyle(property: string): string | undefined;

  /**
   * Returns true if style keys are present.
   * If more then one style property is provided - returns true only when all properties are present.
   *
   * @param {...String} property
   */
  hasStyle(...property: string[]): boolean;

  // TODO[cke] This is a protected method! Do we really need to use it?
  _removeStyle(styleName: string | Array<string>): void;

  /**
   * Gets child nodes iterator.
   *
   * @returns {Iterable.<ViewNode>} Child nodes iterator.
   */
  getChildren(): Iterable<ViewNode>;

  /**
   * Gets index of the given child node. Returns `-1` if child node is not found.
   *
   * @param {ViewNode} node Child node.
   * @returns {number} Index of the child node.
   */
  getChildIndex(node: ViewNode): number;

  // TODO[cke] This is a protected method! Do we really need to use it?
  _insertChild(index: number, items: Item | Iterable<Item>): number;

  // TODO[cke] This is a protected method! Do we really need to use it?
  _removeChildren(index: number, howMany?: number): Array<ViewNode>;
}
