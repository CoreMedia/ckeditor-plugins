import Emitter, { CallbackFunction } from "@ckeditor/ckeditor5-utils/src/emittermixin";
import ViewDocumentFragment from "../view/documentfragment";
import ViewElement from "../view/element";
import Writer from "../model/writer";
import Schema, { SchemaContextDefinition } from "../model/schema";
import DocumentFragment from "../model/documentfragment";
import { PriorityString } from "@ckeditor/ckeditor5-utils/src/priorities";
import EventInfo from "@ckeditor/ckeditor5-utils/src/eventinfo";
import DomEventData from "../view/observer/domeventdata";

/**
 * Upcast dispatcher is a central point of the view-to-model conversion
 *
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_conversion_upcastdispatcher-UpcastDispatcher.html">Class UpcastDispatcher (engine/conversion/upcastdispatcher~UpcastDispatcher) - CKEditor 5 API docs</a>
 */
export default class UpcastDispatcher implements Emitter {
  conversionApi: UpcastConversionApi;

  constructor(conversionApi?: UpcastConversionApi);

  convert(viewItem: ViewDocumentFragment | ViewElement, writer: Writer, context?: SchemaContextDefinition): DocumentFragment;

  on(event: string, callback: CallbackFunction, options?: { priority: PriorityString | number }): void;

  off(event: string, callback?: CallbackFunction): void;

  once(event: string, callback: CallbackFunction, options?: { priority: PriorityString | number }): void;

  fire(eventOrInfo: string | EventInfo, ...args: any[]): any;

  stopListening(emitter?: Emitter, event?: string, callback?: (info: EventInfo, data: DomEventData) => void): void;

  listenTo(emitter: Emitter, event: string, callback: (info: EventInfo, data: any) => void, options?: { priority: PriorityString | number }): void;
}

/**
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_conversion_upcastdispatcher-UpcastConversionApi.html">Interface UpcastConversionApi (engine/conversion/upcastdispatcher~UpcastConversionApi) - CKEditor 5 API docs</a>
 */
export interface UpcastConversionApi {
  consumable : any;
  schema : Schema;
  store : Object;
  writer : Writer;
}
