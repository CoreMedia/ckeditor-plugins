import Position from "./position";
import Element from "./element";
import DocumentFragment from "./documentfragment";
import { Item } from "./item";
import TreeWalker, { TreeWalkerOptions } from "./treewalker";
import Operation from "./operation/operation";
import Document from "./document";

/**
 * Represents a range in the model tree.
 *
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_model_range-Range.html">Class Range (engine/model/range~Range) - CKEditor 5 API docs</a>
 */
export default class Range {
  constructor(start: Position, end?: Position);

  [Symbol.iterator](): Generator<any, void, any>;

  get end(): Position;

  get isCollapsed(): boolean;

  get isFlat(): boolean;

  get root(): Element | DocumentFragment;

  get start(): Position;

  clone(): Range;

  containsItem(item: Item): boolean;

  containsPosition(position: Position): boolean;

  containsRange(otherRange: Range, loose?: boolean): boolean;

  getCommonAncestor(): Element | DocumentFragment | null;

  getContainedElement(): Element | null;

  getDifference(otherRange: Range): Range[];

  getIntersection(otherRange: Range): Range | null;

  getItems(options?: TreeWalkerOptions): Iterable<Item>;

  getJoined(otherRange: Range, loose?: boolean): Range | null;

  getMinimalFlatRanges(): Range[];

  getPositions(options?: TreeWalkerOptions): Iterable<Position>;

  getTransformedByOperation(operation: Operation): Range[];

  getTransformedByOperations(operations: Iterable<Operation>): Range[];

  getWalker(options?: TreeWalkerOptions): TreeWalker;

  is(type: string): boolean;

  isEqual(otherRange: Range): boolean;

  isIntersecting(otherRange: Range): boolean;

  toJSON(): Object;

  static fromJSON(json: Object, doc: Document): Range;
}
