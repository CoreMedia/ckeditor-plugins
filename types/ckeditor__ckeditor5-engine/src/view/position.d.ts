/**
 * https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_view_position-Position.html
 */
import { TreeWalkerOptions } from "./treewalker";
import TreeWalker from "./treewalker";
import DocumentFragment from "./documentfragment";
import Node from "./node";

export default class Position {
  constructor(parent: Node | DocumentFragment, offset: number);
  getWalker(options?: TreeWalkerOptions): TreeWalker
}