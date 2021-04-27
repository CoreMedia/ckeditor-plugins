import Emitter from "@ckeditor/ckeditor5-utils/src/emittermixin"
import Observable, { BindReturnValue } from "@ckeditor/ckeditor5-utils/src/observablemixin"
import { PriorityString } from "@ckeditor/ckeditor5-utils/src/priorities"

import Editor from "./editor/editor";

export default abstract class Plugin<T = void> implements Emitter, Observable {
  readonly editor: Editor;

  static readonly pluginName?: string;
  static readonly requires?: Array<new(editor: Editor) => Plugin>;

  constructor(editor: Editor);

  init?(): null | Promise<T>;

  afterInit?(): null | Promise<T>;

  on(event: string, callback: Function, options?: { priority: PriorityString | number }): void;

  once(event: string, callback: Function, options?: { priority: PriorityString | number }): void;

  set(name: string | Object, value?: any): void;

  bind(...bindProperties: any[]): BindReturnValue;
}
