import Emitter from "./emittermixin";
import { PriorityString } from "./priorities";

/**
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_utils_observablemixin-Observable.html">Interface Observable (utils/observablemixin~Observable) - CKEditor 5 API docs</a>
 */
export default interface Observable extends Emitter {
  on(event: string, callback: Function, options?: { priority: PriorityString | number }): void;
}
