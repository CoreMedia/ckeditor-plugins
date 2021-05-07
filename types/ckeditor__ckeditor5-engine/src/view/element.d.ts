import ViewDocument from "./document"
import ViewNode from "./node"
import { Item } from "./item";

/**
 * View element.
 *
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_view_element-Element.html">Class Element (engine/view/element~Element) - CKEditor 5 API docs</a>
 */
export default class Element extends ViewNode {
  get childCount(): number;

  get document(): ViewDocument;

  get isEmpty(): boolean;

  get isAllowedInsideAttributeElement(): boolean;

  constructor(document: ViewDocument, name: string, attrs: any, children: Node | Iterable<Node>);

  findAncestor(...patterns: any[]): Element;

  getAttribute(key: string): string | undefined;

  getAttributeKeys(): Iterable<string>;

  getAttributes(): Iterable<any>;

  getChild(index: number): ViewNode;

  getChildIndex(node: ViewNode): number | -1;

  getChildren(): IterableIterator<ViewNode>;

  getClassNames(): IterableIterator<string>;

  getCustomProperties(): Generator<[string, any]>;

  getCustomProperty(key: string | Symbol): any;

  getIdentity(): string;

  getNormalizedStyle(property: string): Object | string | undefined;

  getStyle(property: string): string | undefined;

  getStyleNames(): Iterable<string>;

  hasAttribute(key: string): boolean;

  hasStyle(...property: string[]): boolean;

  is(type: string, name?: string): boolean;

  isSimilar(otherElement: Element): boolean;

  // TODO[cke] This is a protected method! Do we really need to use it?
  _removeStyle(styleName: string | Array<string>): void;

  // TODO[cke] This is a protected method! Do we really need to use it?
  _insertChild(index: number, items: Item | Iterable<Item>): number;

  // TODO[cke] This is a protected method! Do we really need to use it?
  _removeChildren(index: number, howMany?: number): Array<ViewNode>;
}
