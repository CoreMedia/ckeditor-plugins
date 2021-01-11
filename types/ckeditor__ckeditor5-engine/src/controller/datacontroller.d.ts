import Document from "../view/document"
import Model from "../model/model"
import Emitter from "@ckeditor/ckeditor5-utils/src/emittermixin"
import Observable from "@ckeditor/ckeditor5-utils/src/observablemixin"
import {PriorityString} from "@ckeditor/ckeditor5-utils/src/priorities"
import DataProcessor from "../dataprocessor/dataprocessor";

/**
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_controller_datacontroller-DataController.html">Class DataController (engine/controller/datacontroller~DataController) - CKEditor 5 API docs</a>
 * @see <a href="https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/ckeditor__ckeditor5-engine/index.d.ts">DefinitelyTyped</a>
 */
export default class DataController implements Emitter, Observable {
  processor: DataProcessor;
  readonly viewDocument : Document;

  constructor(model: Model, dataProcessor?: DataProcessor);

  on(event: string, callback: Function, options?: { priority: PriorityString | number }): void;
}
