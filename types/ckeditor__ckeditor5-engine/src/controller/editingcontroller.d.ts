import View from "../view/view"
import Emitter, { CallbackFunction } from "@ckeditor/ckeditor5-utils/src/emittermixin"
import Observable, { BindReturnValue } from "@ckeditor/ckeditor5-utils/src/observablemixin"
import { PriorityString } from "@ckeditor/ckeditor5-utils/src/priorities"

/**
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_controller_editingcontroller-EditingController.html">Class EditingController (engine/controller/editingcontroller~EditingController) - CKEditor 5 API docs</a>
 */
export default class EditingController implements Emitter, Observable {
  readonly view: View;

  on(event: string, callback: CallbackFunction, options?: { priority: PriorityString | number }): void;

  off(event: string, callback?: CallbackFunction): void;

  once(event: string, callback: CallbackFunction, options?: { priority: PriorityString | number }): void;

  set(name: string | Object, value?: any): void;

  bind(...bindProperties: any[]): BindReturnValue;
}
