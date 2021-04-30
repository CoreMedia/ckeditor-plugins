import Range from "./range";
import Position from "./position";
import { Item } from "./item";

/**
 * Position iterator class. It allows to iterate forward and backward over the document.
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_model_treewalker-TreeWalker.html">Class TreeWalker (engine/model/treewalker~TreeWalker) - CKEditor 5 API docs</a>
 */
export default class TreeWalker {
  constructor(options?: TreeWalkerOptions);

  [Symbol.iterator](): Iterable<TreeWalkerValue>;

  next(): TreeWalkerValue;

  skip(skip: (value: TreeWalkerValue) => boolean): void;
}

export type TreeWalkerOptions = {
  direction?: TreeWalkerDirection,
  boundaries?: Range,
  startPosition?: Position,
  singleCharacters?: boolean,
  shallow?: boolean,
  ignoreElementEnd?: boolean,
};

/**
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_model_treewalker-TreeWalkerDirection.html">Typedef TreeWalkerDirection (engine/model/treewalker~TreeWalkerDirection) - CKEditor 5 API docs</a>
 */
export type TreeWalkerDirection = "forward" | "backward";

/**
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_model_treewalker-TreeWalkerValueType.html">Typedef TreeWalkerValueType (engine/model/treewalker~TreeWalkerValueType) - CKEditor 5 API docs</a>
 */
export type TreeWalkerValueType = "elementStart" | "elementEnd" | "character" | "text";

/**
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_model_treewalker-TreeWalkerValue.html">Typedef TreeWalkerValue (engine/model/treewalker~TreeWalkerValue) - CKEditor 5 API docs</a>
 */
export type TreeWalkerValue = {
  item: Item,
  length: number,
  nextPosition: Position,
  previousPosition: Position,
  type: TreeWalkerValueType,
};
