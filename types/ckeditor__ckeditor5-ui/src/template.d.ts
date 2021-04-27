/**
 * A basic Template class.
 */
import View from "./view/view";
import Emitter from "@ckeditor/ckeditor5-utils/src/emittermixin";
import { PriorityString } from "@ckeditor/ckeditor5-utils/src/priorities";

export default class Template implements Emitter {
  constructor(def: any);
  render(): HTMLElement|Text;
  apply(node: Node): any;
  revert(node: Node): void;
  getViews(): Generator<View, void, any>;

  on(event: string, callback: Function, options?: { priority: PriorityString | number }): void;

  once(event: string, callback: Function, options?: { priority: PriorityString | number }): void;
}
