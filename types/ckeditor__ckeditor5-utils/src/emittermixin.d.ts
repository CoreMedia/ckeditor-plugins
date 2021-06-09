import { PriorityString } from "./priorities";
import EventInfo from "./eventinfo";
import DomEventData from "@ckeditor/ckeditor5-engine/src/view/observer/domeventdata";

export type CallbackFunction = (evt: EventInfo, ...args: any[]) => void;

/**
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_utils_emittermixin-Emitter.html">Interface Emitter (utils/emittermixin~Emitter) - CKEditor 5 API docs</a>
 */
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
  on(event: string, callback: CallbackFunction, options?: { priority: PriorityString | number }): void;

  off(event: string, callback?: CallbackFunction): void;

  /**
   * Registers a callback function to be executed on the next time the event is fired only. This is similar to
   * calling {@link #on} followed by {@link #off} in the callback.
   *
   * @param {String} event The name of the event.
   * @param {Function} callback The function to be called on event.
   * @param {Object} [options={}] Additional options.
   * @param {module:utils/priorities~PriorityString|Number} [options.priority='normal'] The priority of this event callback. The higher
   * the priority value the sooner the callback will be fired. Events having the same priority are called in the
   * order they were added.
   */
  once(event: string, callback: CallbackFunction, options?: { priority: PriorityString | number }): void;
  fire(eventOrInfo: string | EventInfo, ...args: any[]): any;
  stopListening(emitter?: Emitter, event?: string, callback?: (info: EventInfo, data: DomEventData) => void): void;
}
