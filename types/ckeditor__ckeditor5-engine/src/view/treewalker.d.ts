import Element from "./element";
import { Item } from "./item";
import Position from "./position";

/**
 * https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_view_treewalker-TreeWalker.html
 */
export default class TreeWalker {
  constructor(parent: Element);

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
  type: TreeWalkerValueType,
};

/**
 * https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_view_treewalker-TreeWalkerValueType.html
 */
export type TreeWalkerValueType = "elementStart" | "elementEnd" | "character" | "text";

export type TreeWalkerOptions = {
  startPosition?: Position,
  singleCharacters?: boolean,
  shallow?: boolean,
  ignoreElementEnd?: boolean,
};
