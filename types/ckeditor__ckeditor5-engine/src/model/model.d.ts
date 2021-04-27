import Emitter from "@ckeditor/ckeditor5-utils/src/emittermixin";
import Observable, { BindReturnValue } from "@ckeditor/ckeditor5-utils/src/observablemixin";
import { PriorityString } from "@ckeditor/ckeditor5-utils/src/priorities";
import Schema from "./schema";

/**
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_model_model-Model.html">Class Model (engine/model/model~Model) - CKEditor 5 API docs</a>
 */
export default class Model implements Emitter, Observable {
  readonly schema: Schema;

  on(event: string, callback: Function, options?: { priority: PriorityString | number }): void;

  once(event: string, callback: Function, options?: { priority: PriorityString | number }): void;

  set(name: string | Object, value?: any): void;

  bind(...bindProperties: any[]): BindReturnValue;
}
