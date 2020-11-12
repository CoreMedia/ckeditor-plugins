import Emitter from "@ckeditor/ckeditor5-utils/src/emittermixin";
import Observable from "@ckeditor/ckeditor5-utils/src/observablemixin";
import {PriorityString} from "@ckeditor/ckeditor5-utils/src/priorities";

/**
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_view_view-View.html">Class View (engine/view/view~View) - CKEditor 5 API docs</a>
 */
export default class View implements Emitter, Observable {
  readonly document: Document;

  on(event: string, callback: Function, options?: { priority: PriorityString | number }): void;
}
