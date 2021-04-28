import Element from "./element";
import DocumentFragment from "./documentfragment";
import Text from "./text";
import Node from "./node";
import { Item } from "./item";

export type PositionRelation = "different" | "same" | "before" | "after";

export type PositionStickiness = "toNone" | "toNext" | "toPrevious";

/**
 * Represents a position in the model tree.
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_model_position-Position.html">Class Position (engine/model/position~Position) - CKEditor 5 API docs</a>
 */
export default class Position {
  get index(): number;

  get isAtEnd(): boolean;

  get isAtStart(): boolean;

  get nodeAfter(): Node | null;

  get nodeBefore(): Node | null;

  get offset(): number;
  set offset(newOffset: number);

  get parent(): Element | DocumentFragment;

  get path(): number[];

  get root(): Element | DocumentFragment;

  get stickiness(): PositionStickiness;

  get textNode(): Text | null;

  constructor(root: Element | DocumentFragment, path: number[], stickiness?: PositionStickiness);

  clone(): Position;

  compareWith(otherPosition: Position): PositionRelation;

  findAncestor(parentName: string): Element | null;

  getAncestors(): Item[];

  getCommonAncestor(position: Position): Element | DocumentFragment | null;

  getCommonPath(position: Position): number[];

  getLastMatchingPosition(skip: (value: any) => boolean, options?: Object): Position;

  getParentPath(): number[];

  getShiftedBy(shift: number): Position;

  getTransformedByOperation(operation: Object): Position

  hasSameParentAs(position: Position): boolean;

  is(type: string): boolean;

  isAfter(otherPosition: Position): boolean;

  isBefore(otherPosition: Position): boolean;

  isEqual(otherPosition: Position): boolean;

  isTouching(otherPosition: Position): boolean | undefined;

  toJSON(): {
    root: any;
    path: number[];
    stickiness: PositionStickiness;
  };

  static fromJSON(json: Object, doc: Object): Position;
}
