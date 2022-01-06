import { PriorityString } from "@ckeditor/ckeditor5-utils/src/priorities";
import { CallbackFunction } from "@ckeditor/ckeditor5-utils/src/emittermixin";
import ViewElement from "../view/element"
import ModelElement from "../model/element"

export default class Mapper {
  toViewElement(modelElement: ModelElement): ViewElement | undefined;
  on(event: string, callback: CallbackFunction, options?: {priority: PriorityString}): void;
}