import Range from "./range"
import { Item } from "./item";
import Position from "./position";

/**
 * https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_view_treewalker-TreeWalker.html
 */
export default class TreeWalker {
  [Symbol.iterator](): Iterable<TreeWalkerValue>;

  next(): {done: boolean, value: TreeWalkerValue};

  skip(skip: (value: TreeWalkerValue) => boolean): void;
}

/**
 * https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_view_treewalker-TreeWalkerValue.html
 */
export type TreeWalkerValue = {
  item: Item,
  length: number,
  nextPosition: Position,
  previousPosition: Position,
  type: TreeWalkerValueType
};

export type TreeWalkerOptions = {
  boundaries?: Range,
  singleCharacters?: boolean,
  shallow?: boolean,
  ignoreElementEnd?: boolean
};

/**
 * https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_view_treewalker-TreeWalkerValueType.html
 */
export type TreeWalkerValueType = "elementStart" | "elementEnd" | "text";