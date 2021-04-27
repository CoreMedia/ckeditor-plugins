import ViewDocument from "../view/document"
import Emitter from "@ckeditor/ckeditor5-utils/src/emittermixin"
import Observable, { BindReturnValue } from "@ckeditor/ckeditor5-utils/src/observablemixin"
import { PriorityString } from "@ckeditor/ckeditor5-utils/src/priorities"
import DataProcessor from "../dataprocessor/dataprocessor";

/**
 * Controller for the data pipeline.
 *
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_controller_datacontroller-DataController.html">Class DataController (engine/controller/datacontroller~DataController) - CKEditor 5 API docs</a>
 */
export default class DataController implements Emitter, Observable {
  processor: DataProcessor;
  readonly viewDocument: ViewDocument;

  on(event: string, callback: Function, options?: { priority: PriorityString | number }): void;

  once(event: string, callback: Function, options?: { priority: PriorityString | number }): void;

  set(name: string | Object, value?: any): void;

  bind(...bindProperties: any[]): BindReturnValue;
}
