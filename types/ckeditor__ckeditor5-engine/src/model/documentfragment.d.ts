import Node from "./node";

/**
 * DocumentFragment represents a part of model which does not have a common root but its top-level nodes
 * can be seen as siblings. In other words, it is a detached part of model tree, without a root.
 *
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_model_documentfragment-DocumentFragment.html">Class DocumentFragment (engine/model/documentfragment~DocumentFragment) - CKEditor 5 API docs</a>
 */
export default class DocumentFragment {
  get childCount(): number;

  get isEmpty(): boolean;

  get markers(): { [key: string]: any };

  get maxOffset(): number;

  get parent(): null;

  get root(): this;

  [Symbol.iterator](): Iterable<Element|Text>;

  getChild(index: number): Node | null;

  getChildIndex(node: Node): number | null;

  getChildStartOffset(node: Node): number | null;

  getChildren(): IterableIterator<Element|Text>;

  getNodeByPath(relativePath: number[]): Node | DocumentFragment;

  getPath(): never[];

  is(type: string): boolean;

  offsetToIndex(offset: number): number;

  toJSON(): Object;

  static fromJSON(json: Object): DocumentFragment;
}
