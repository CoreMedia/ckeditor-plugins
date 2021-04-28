import Position from "../model/position";
import Element from "../model/element";
import Schema from "../model/schema";
import DowncastWriter from "../view/downcastwriter";

/**
 * The downcast dispatcher is a central point of downcasting (conversion from the model to the view), which is a process of reacting
 * to changes in the model and firing a set of events.
 *
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_conversion_downcastdispatcher-DowncastDispatcher.html">Class DowncastDispatcher (engine/conversion/downcastdispatcher~DowncastDispatcher) - CKEditor 5 API docs</a>
 */
export default class DowncastDispatcher {
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
}

/**
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_conversion_downcastdispatcher-DowncastConversionApi.html">Interface DowncastConversionApi (engine/conversion/downcastdispatcher~DowncastConversionApi) - CKEditor 5 API docs</a>
 */
export interface DowncastConversionApi {
  consumable: any;
  dispatcher: DowncastDispatcher;
  mapper: any;
  options: Object;
  schema: Schema;
  writer: DowncastWriter;
}
