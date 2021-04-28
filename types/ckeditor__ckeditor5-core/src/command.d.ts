/**
 * The base class for CKEditor commands.
 *
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_core_command-Command.html">Class Command (core/command~Command) - CKEditor 5 API docs</a>
 */
import Editor from "./editor/editor";
import Observable, { BindReturnValue } from "@ckeditor/ckeditor5-utils/src/observablemixin";
import Emitter, { CallbackFunction } from "@ckeditor/ckeditor5-utils/src/emittermixin";
import { PriorityString } from "@ckeditor/ckeditor5-utils/src/priorities";

export default class Command implements Emitter, Observable {
  readonly editor: Editor;
  readonly isEnabled: boolean;

  constructor(editor: Editor);
  refresh(): void;
  forceDisabled(id: string): void;
  clearForceDisabled(id: string): void;
  execute(): void;
  destroy(): void;

  on(event: string, callback: CallbackFunction, options?: { priority: PriorityString | number }): void;

  once(event: string, callback: CallbackFunction, options?: { priority: PriorityString | number }): void;

  set(name: string | Object, value?: any): void;

  bind(...bindProperties: any[]): BindReturnValue;
}
