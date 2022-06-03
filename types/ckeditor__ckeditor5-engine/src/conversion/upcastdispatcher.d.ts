import { CallbackFunction, Emitter, EmitterMixinDelegateChain } from "@ckeditor/ckeditor5-utils/src/emittermixin";
import ViewDocumentFragment from "../view/documentfragment";
import ViewElement from "../view/element";
import Writer from "../model/writer";
import Schema, { SchemaContextDefinition } from "../model/schema";
import DocumentFragment from "../model/documentfragment";
import { PriorityString } from "@ckeditor/ckeditor5-utils/src/priorities";
import EventInfo from "@ckeditor/ckeditor5-utils/src/eventinfo";
import { Item } from "../view/item";
import Position from "../model/position";
import Element from "../model/element";
import Range from "../model/range";
import ModelRange from "../model/range";
import ViewConsumable from "./viewconsumable";

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

  stopListening(emitter?: Emitter, event?: string, callback?: CallbackFunction): void;

  listenTo(emitter: Emitter, event: string, callback: CallbackFunction, options?: { priority: PriorityString | number }): void;

  delegate(...events: string[]): EmitterMixinDelegateChain;
}

/**
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_conversion_upcastdispatcher-UpcastConversionApi.html">Interface UpcastConversionApi (engine/conversion/upcastdispatcher~UpcastConversionApi) - CKEditor 5 API docs</a>
 */
export interface UpcastConversionApi {
  consumable: ViewConsumable;
  schema: Schema;
  store: Object;
  writer: Writer;

  convertChildren(viewItem: Item, positionOrElement: Position | Element): { modelRange: Range, modelCursor: Position };

  convertItem(viewItem: Item, positionOrElement: Position | Element): { modelRange: Range | null, modelCursor: Position }
}

export type UpcastEventData = {
  viewItem: ViewElement,
  modelRange: ModelRange
}
