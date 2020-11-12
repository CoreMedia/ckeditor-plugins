import View from "../view/view"
import Model from "../model/model"
import Emitter from "@ckeditor/ckeditor5-utils/src/emittermixin"
import Observable from "@ckeditor/ckeditor5-utils/src/observablemixin"
import {PriorityString} from "@ckeditor/ckeditor5-utils/src/priorities"

export default class EditingController implements  Emitter, Observable {
  readonly view: View;

  constructor(model: Model);

  on(event: string, callback: Function, options?: { priority: PriorityString | number }): void;
}
