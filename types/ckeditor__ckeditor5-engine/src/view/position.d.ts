/**
 * https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_view_position-Position.html
 */
import TreeWalker, { TreeWalkerOptions } from "./treewalker";
import DocumentFragment from "./documentfragment";
import Node from "./node";
import ViewElement from "./element";

export default class Position {
  constructor(parent: Node | DocumentFragment, offset: number);

  getWalker(options?: TreeWalkerOptions): TreeWalker

  nodeAfter: Node | null;

  parent: ViewElement | DocumentFragment;

  offset: number;
}
