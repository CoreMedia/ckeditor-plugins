import Position from "../model/position";
import Element from "../model/element";
import Schema from "../model/schema";
import DowncastWriter from "../view/downcastwriter";
import { CallbackFunction, Emitter, EmitterMixinDelegateChain } from "@ckeditor/ckeditor5-utils/src/emittermixin";
import eventinfo from "@ckeditor/ckeditor5-utils/src/eventinfo";
import { PriorityString } from "@ckeditor/ckeditor5-utils/src/priorities";
import Range from "../model/range";
import { Item } from "../model/item";
import Mapper from "./mapper";
import ModelConsumable from "./modelconsumable";

/**
 * The downcast dispatcher is a central point of downcasting (conversion from the model to the view), which is a process of reacting
 * to changes in the model and firing a set of events.
 *
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_conversion_downcastdispatcher-DowncastDispatcher.html">Class DowncastDispatcher (engine/conversion/downcastdispatcher~DowncastDispatcher) - CKEditor 5 API docs</a>
 */
export default class DowncastDispatcher implements Emitter {
  constructor(conversionApi: DowncastConversionApi);

  on(event: string, callback: CallbackFunction, options?: { priority: number | PriorityString; }): void;

  off(event: string, callback?: CallbackFunction): void;

  delegate(...events: string[]): EmitterMixinDelegateChain;

  once(event: string, callback: CallbackFunction, options?: { priority: number | PriorityString; }): void;

  listenTo(emitter: Emitter, event: string, callback: CallbackFunction, options?: { priority?: number | PriorityString | undefined; }): void;

  fire(eventOrInfo: string | eventinfo, ...args: any[]): any;

  stopListening(emitter?: Emitter, event?: string, callback?: CallbackFunction): void;

  convertAttribute(range: any, key: string, oldValue: any, newValue: any, writer: any): void;

  convertChanges(differ: any, markers: any, writer: any): void;

  convert(range: any, markers: any, writer: any, options?: any): void;

  convertMarkerAdd(markerName: string, markerRange: any, writer: any): void;

  convertMarkerRemove(markerName: string, markerRange: any, writer: any): void;

  convertRemove(position: Position, length: number, name: string, writer: any): void;

  convertSelection(selection: any, markers: any, writer: any): void;

  reconvertElement(element: Element, writer: any): void;
}

/**
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_conversion_downcastdispatcher-DowncastConversionApi.html">Interface DowncastConversionApi (engine/conversion/downcastdispatcher~DowncastConversionApi) - CKEditor 5 API docs</a>
 */
export interface DowncastConversionApi {
  consumable: ModelConsumable;
  dispatcher: DowncastDispatcher;
  mapper: Mapper;
  options: Object;
  schema: Schema;
  writer: DowncastWriter;
}

export type AddMarkerEventData = {
  markerName: string,
  range?: Range,
  markerRange: Range,
  item: Item
}
export type RemoveMarkerEventData = {
  markerName: string,
  markerRange: Range,
}

export type DowncastEventData = { item: Element, attributeOldValue: string | null, attributeNewValue: string | null };
