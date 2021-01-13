import Emitter from "@ckeditor/ckeditor5-utils/src/emittermixin";
import Observable from "@ckeditor/ckeditor5-utils/src/observablemixin";
import { PriorityString } from "@ckeditor/ckeditor5-utils/src/priorities";
import ViewDocument from "./document"

/**
 * Editor's view controller class. Its main responsibility is DOM - View
 * management for editing purposes, to provide abstraction over the DOM
 * structure and events and hide all browsers quirks.
 *
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_view_view-View.html">Class View (engine/view/view~View) - CKEditor 5 API docs</a>
 */
export default class View implements Emitter, Observable {
  /**
   * Instance of the `Document` associated with this view controller.
   */
  readonly document: ViewDocument;

  on(event: string, callback: Function, options?: { priority: PriorityString | number }): void;
}
