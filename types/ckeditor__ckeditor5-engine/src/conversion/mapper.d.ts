import { PriorityString } from "@ckeditor/ckeditor5-utils/src/priorities";
import { CallbackFunction } from "@ckeditor/ckeditor5-utils/src/emittermixin";
import ViewElement from "../view/element"
import ModelElement from "../model/element"
import ViewPosition from "../view/position";
import ModelPosition from "../model/position";
import ModelRange from "../model/range";
import ViewRange from "../view/range";

/**
 * https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_conversion_mapper-Mapper.html
 */
export default class Mapper {
  toViewElement(modelElement: ModelElement): ViewElement | undefined;
  toViewPosition(modelPosition: ModelPosition): ViewPosition;

  toModelElement(viewElement: ViewElement): ModelElement | undefined;
  toModelRange(viewRange: ViewRange): ModelRange;

  bindElementToMarker(element: ViewElement, name: string): void;
  markerNameToElements(name: string): Set<ViewElement> | null;
  unbindElementFromMarkerName(element: ViewElement, name: string): void;
  toViewRange(modelRange:ModelRange): ViewRange;
  on(event: string, callback: CallbackFunction, options?: {priority: PriorityString}): void;
}
