import Observable, { BindReturnValue } from "@ckeditor/ckeditor5-utils/src/observablemixin";
import Emitter, { CallbackFunction } from "@ckeditor/ckeditor5-utils/src/emittermixin";
import { PriorityString } from "@ckeditor/ckeditor5-utils/src/priorities";
import Collection from "@ckeditor/ckeditor5-utils/src/collection";
import EventInfo from "@ckeditor/ckeditor5-utils/src/eventinfo";
import DomEventData from "@ckeditor/ckeditor5-engine/src/view/observer/domeventdata";

/**
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_ui_view-View.html">Class View (ui/view~View) - CKEditor 5 API docs</a>
 */
export default class Viewcollection<T = any> extends Collection implements Emitter, Observable {

  constructor(initialItems?: Iterable<T>);


  destroy(): void;

  on(event: string, callback: CallbackFunction, options?: { priority: PriorityString | number }): void;

  off(event: string, callback?: CallbackFunction): void;

  once(event: string, callback: CallbackFunction, options?: { priority: PriorityString | number }): void;

  set(name: string | Object, value?: any): void;

  bind(...bindProperties: any[]): BindReturnValue;

  fire(eventOrInfo: string | EventInfo, ...args: any[]): any;

  stopListening(emitter?: Emitter, event?: string, callback?: (info: EventInfo, data: DomEventData) => void): void;
}
