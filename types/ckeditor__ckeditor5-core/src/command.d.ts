/**
 * The base class for CKEditor commands.
 *
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_core_command-Command.html">Class Command (core/command~Command) - CKEditor 5 API docs</a>
 */
import Editor from "./editor/editor";
import Observable, { BindReturnValue } from "@ckeditor/ckeditor5-utils/src/observablemixin";
import Emitter, {CallbackFunction, EmitterMixinDelegateChain} from "@ckeditor/ckeditor5-utils/src/emittermixin";
import { PriorityString } from "@ckeditor/ckeditor5-utils/src/priorities";
import EventInfo from "@ckeditor/ckeditor5-utils/src/eventinfo";
import DomEventData from "@ckeditor/ckeditor5-engine/src/view/observer/domeventdata";

export default class Command implements Observable {
  value?: unknown;
  readonly editor: Editor;
  isEnabled: boolean;

  constructor(editor: Editor);

  refresh(): void;

  forceDisabled(id: string): void;

  clearForceDisabled(id: string): void;

  execute(...args: any[]): any;

  destroy(): void;

  on(event: string, callback: CallbackFunction, options?: { priority: PriorityString | number }): void;

  off(event: string, callback?: CallbackFunction): void;

  once(event: string, callback: CallbackFunction, options?: { priority: PriorityString | number }): void;

  set(name: string | Object, value?: any): void;

  bind(...bindProperties: any[]): BindReturnValue;

  fire(eventOrInfo: string | EventInfo, ...args: any[]): any;

  stopListening(emitter?: Emitter, event?: string, callback?: CallbackFunction): void;

  listenTo(emitter: Emitter, event: string, callback: CallbackFunction, options?: { priority: PriorityString | number }): void;

  decorate(methodName: string): void;

  delegate(...events: string[]): EmitterMixinDelegateChain;
}
