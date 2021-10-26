import ViewDocument from "./document";
import ViewDocumentFragment from "./documentfragment";
import ViewElement from "./element";
import Element from "./element";
import ViewNode from "./node";
import {Item} from "./item";
import DocumentFragment from "./documentfragment";
import Document from "./document";
import Range from "./range";

/**
 * View upcast writer. It provides a set of methods used to manipulate non-semantic view trees.
 *
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_view_upcastwriter-UpcastWriter.html">Class UpcastWriter (engine/view/upcastwriter~UpcastWriter) - CKEditor 5 API docs</a>
 */
export default class UpcastWriter {
  document: Document;
  constructor(document: ViewDocument);

  /**
   * Clones the provided element.
   *
   * @param {ViewElement} element Element to be cloned.
   * @param {boolean} [deep=false] If set to `true` clones element and all its children recursively. When set to `false`,
   * element will be cloned without any children.
   * @returns {ViewElement} Clone of this element.
   */
  clone(element: ViewElement, deep?: boolean): ViewElement;

  /**
   * Creates a new `DocumentFragment` instance.
   *
   * @param children [Node|Iterable<Node>]
   * A list of nodes to be inserted into the created document fragment.
   * @returns [DocumentFragment] The created document fragment.
   */
  createDocumentFragment( children?: ViewNode | Iterable<ViewNode> ): ViewDocumentFragment;

  /**
   * Appends a child node or a list of child nodes at the end of this node and sets the parent of these nodes to this element.
   *
   * @param items Items to be inserted.
   * @param element Element to which items will be appended.
   *
   * @return Number of appended nodes.
   */
  appendChild( items: Item | Iterable<Item>, element: Element | DocumentFragment ): number;

  /**
   *
   * @param name
   * @param attrs
   * @param children
   */
  createElement( name: string, attrs?: Object | Iterable<any> , children?: Node | Iterable<Node> | string): Element

  createRangeIn(element: Element): Range;

  createRangeOn(item: Item): Range;

  setAttribute(key: string, value: string, element: Element): void;

  replace(oldElement: Element, newElement: Element): boolean;
}
