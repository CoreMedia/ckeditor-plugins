import Emitter, { CallbackFunction, EmitterMixinDelegateChain } from "@ckeditor/ckeditor5-utils/src/emittermixin";
import Observable, { BindReturnValue } from "@ckeditor/ckeditor5-utils/src/observablemixin";
import { PriorityString } from "@ckeditor/ckeditor5-utils/src/priorities";
import ViewDocument from "./document"
import EventInfo from "@ckeditor/ckeditor5-utils/src/eventinfo";
import { Item } from "./item";
import Position from "./position";
import Element from "./element";
import Range from "./range";

/**
 * Editor's view controller class. Its main responsibility is DOM - View
 * management for editing purposes, to provide abstraction over the DOM
 * structure and events and hide all browsers quirks.
 *
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_view_view-View.html">Class View (engine/view/view~View) - CKEditor 5 API docs</a>
 */
export default class View implements Emitter, Observable {
  /**
   * Instance of the `Document` associated with this view controller.
   */
  readonly document: ViewDocument;

  on(event: string, callback: CallbackFunction, options?: { priority: PriorityString | number }): void;

  off(event: string, callback?: CallbackFunction): void;

  once(event: string, callback: CallbackFunction, options?: { priority: PriorityString | number }): void;

  set(name: string | Object, value?: any): void;

  bind(...bindProperties: any[]): BindReturnValue;

  focus(): void;

  fire(eventOrInfo: string | EventInfo, ...args: any[]): any;

  stopListening(emitter?: Emitter, event?: string, callback?: CallbackFunction): void;

  listenTo(emitter: Emitter, event: string, callback: CallbackFunction, options?: { priority: PriorityString | number }): void;

  decorate(methodName: string): void;

  delegate(...events: string[]): EmitterMixinDelegateChain;

  createPositionAt(itemOrPosition: Item | Position, offset: number | "end" | "before" | "after"): Position;

  createPositionAfter(itemOrPosition: Item): Position;

  createRangeIn(element: Element): Range;

  change(callback: Function): any;
}
