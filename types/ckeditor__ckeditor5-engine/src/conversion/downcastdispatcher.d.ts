import Position from "../model/position";
import Element from "../model/element";
import Schema from "../model/schema";
import DowncastWriter from "../view/downcastwriter";
import Emitter, { CallbackFunction, EmitterMixinDelegateChain } from "@ckeditor/ckeditor5-utils/src/emittermixin";
import EventInfo from "@ckeditor/ckeditor5-utils/src/eventinfo";
import { PriorityString } from "@ckeditor/ckeditor5-utils/src/priorities";
import { Mapper } from "./Mapper";
import ModelElement from "../model/element";

/**
 * The downcast dispatcher is a central point of downcasting (conversion from the model to the view), which is a process of reacting
 * to changes in the model and firing a set of events.
 *
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_conversion_downcastdispatcher-DowncastDispatcher.html">Class DowncastDispatcher (engine/conversion/downcastdispatcher~DowncastDispatcher) - CKEditor 5 API docs</a>
 */
export default class DowncastDispatcher implements Emitter {
  conversionApi: DowncastConversionApi;

  constructor(conversionApi: DowncastConversionApi);

  convertAttribute(range: any, key: string, oldValue: any, newValue: any, writer: any): void;

  convertChanges(differ: any, markers: any, writer: any): void;

  convertInsert(range: any, writer: any): void;

  convertMarkerAdd(markerName: string, markerRange: any, writer: any): void;

  convertMarkerRemove(markerName: string, markerRange: any, writer: any): void;

  convertRemove(position: Position, length: number, name: string, writer: any): void;

  convertSelection(selection: any, markers: any, writer: any): void;

  reconvertElement(element: Element, writer: any): void;

  delegate(...events: string[]): EmitterMixinDelegateChain;

  fire(eventOrInfo: string | EventInfo, ...args: any[]): any;

  listenTo(emitter: Emitter, event: string, callback: CallbackFunction, options?: { priority?: PriorityString | number }): void;

  off(event: string, callback?: CallbackFunction): void;

  on(event: string, callback: CallbackFunction, options?: { priority: PriorityString | number }): void;

  once(event: string, callback: CallbackFunction, options?: { priority: PriorityString | number }): void;

  stopListening(emitter?: Emitter, event?: string, callback?: CallbackFunction): void;
}

/**
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_conversion_downcastdispatcher-DowncastConversionApi.html">Interface DowncastConversionApi (engine/conversion/downcastdispatcher~DowncastConversionApi) - CKEditor 5 API docs</a>
 */
export interface DowncastConversionApi {
  consumable: any;
  dispatcher: DowncastDispatcher;
  mapper: Mapper;
  options: Object;
  schema: Schema;
  writer: DowncastWriter;
}

export interface DowncastData {
  item: ModelElement;
  attributeNewValue: string;
}
