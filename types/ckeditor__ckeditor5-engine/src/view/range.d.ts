import Position from "./position";
import { TreeWalkerOptions } from "./treewalker";
import { Item } from "./item";

/**
 * https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_view_range-Range.html
 */
export default class Range {
  start: Position;
  end: Position;

  getItems(options?: TreeWalkerOptions): Iterable<Item>;

  getContainedElement(): Element | null;

  getEnlarged(): Range;
}
