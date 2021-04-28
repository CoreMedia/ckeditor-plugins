import DocumentFragment from "./documentfragment";
import Element from "./element";

/**
 * Model node. Most basic structure of model tree.
 *
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_model_node-Node.html">Class Node (engine/model/node~Node) - CKEditor 5 API docs</a>
 */
export default class Node {
  get endOffset(): number | null;

  get index(): number | null;

  get nextSibling(): Node | null;

  get offsetSize(): number;

  get parent(): Element | DocumentFragment | null;

  get previousSibling(): Node | null;

  get root(): Node | DocumentFragment;

  get startOffset(): number | null;

  constructor(attrs?: Object);

  getAncestors(options?: {
    includeSelf: boolean;
    parentFirst: boolean;
  }): any[];

  getAttribute(key: string): any | undefined;

  getAttributeKeys(): string[];

  getAttributes(): Iterable<any>;

  getCommonAncestor(node: Node, options?: { includeSelf: boolean }): Element | DocumentFragment | null;

  getPath(): Array<number>;

  hasAttribute(key: string): boolean;

  is(type: string): boolean;

  isAfter(node: Node): boolean;

  isAttached(): boolean;

  isBefore(node: Node): boolean;

  toJSON(): Object;
}
