/**
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_utils_emittermixin-Emitter.html">Interface Emitter (utils/emittermixin~Emitter) - CKEditor 5 API docs</a>
 */
import { PriorityString } from "./priorities";

export default interface Emitter {
  /**
   * Registers a callback function to be executed when an event is fired.
   *
   * @param {String} event The name of the event.
   * @param {Function} callback The function to be called on event.
   * @param {Object} [options={}] Additional options.
   * @param {PriorityString|Number} [options.priority='normal'] The priority of this event callback. The higher
   * the priority value the sooner the callback will be fired. Events having the same priority are called in the
   * order they were added.
   */
  on(event: string, callback: Function, options?: { priority: PriorityString | number }): void;
}
