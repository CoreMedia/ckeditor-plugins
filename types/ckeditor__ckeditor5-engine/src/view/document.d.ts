import Emitter, {CallbackFunction, EmitterMixinDelegateChain} from "@ckeditor/ckeditor5-utils/src/emittermixin";
import {PriorityString} from "@ckeditor/ckeditor5-utils/src/priorities";
import EventInfo from "@ckeditor/ckeditor5-utils/src/eventinfo";
import DomEventData from "./observer/domeventdata";
import Observable, {BindReturnValue} from "@ckeditor/ckeditor5-utils/src/observablemixin";
import DocumentSelection from "../model/documentselection";

/**
 * Document class creates an abstract layer over the content editable area,
 * contains a tree of view elements and view selection associated with this document.
 *
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_view_document-Document.html">Class Document (engine/view/document~Document) - CKEditor 5 API docs</a>
 */
export default class Document implements Observable {
  selection: DocumentSelection;

  on(event: string, callback: CallbackFunction, options?: { priority: PriorityString | number }): void;

  fire(eventOrInfo: string | EventInfo, ...args: any[]): any;

  off(event: string, callback?: CallbackFunction): void;

  once(event: string, callback: CallbackFunction, options?: { priority: PriorityString | number }): void;

  stopListening(emitter?: Emitter, event?: string, callback?: CallbackFunction): void;

  listenTo(emitter: Emitter, event: string, callback: CallbackFunction, options?: { priority: PriorityString | number }): void;

  delegate(...events: string[]): EmitterMixinDelegateChain;

  bind(...bindProperties: any[]): BindReturnValue;

  decorate(methodName: string): void;

  set(name: string | Object, value?: any): void;
}
