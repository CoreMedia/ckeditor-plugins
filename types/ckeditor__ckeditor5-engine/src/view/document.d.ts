import Emitter, {CallbackFunction} from "@ckeditor/ckeditor5-utils/src/emittermixin";
import {PriorityString} from "@ckeditor/ckeditor5-utils/src/priorities";
import EventInfo from "@ckeditor/ckeditor5-utils/src/eventinfo";
import DomEventData from "./observer/domeventdata";

/**
 * Document class creates an abstract layer over the content editable area,
 * contains a tree of view elements and view selection associated with this document.
 *
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_view_document-Document.html">Class Document (engine/view/document~Document) - CKEditor 5 API docs</a>
 */
export default class Document implements Emitter {
  on(event: string, callback: CallbackFunction, options?: { priority: PriorityString | number }): void;

  fire(eventOrInfo: string | EventInfo, ...args: any[]): any;

  off(event: string, callback?: CallbackFunction): void;

  once(event: string, callback: CallbackFunction, options?: { priority: PriorityString | number }): void;

  stopListening(emitter?: Emitter, event?: string, callback?: (info: EventInfo, data: DomEventData) => void): void;
}
