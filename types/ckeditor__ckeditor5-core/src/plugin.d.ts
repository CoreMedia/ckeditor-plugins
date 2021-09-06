import Emitter, { CallbackFunction } from "@ckeditor/ckeditor5-utils/src/emittermixin"
import Observable, { BindReturnValue } from "@ckeditor/ckeditor5-utils/src/observablemixin"
import { PriorityString } from "@ckeditor/ckeditor5-utils/src/priorities"

import Editor from "./editor/editor";
import EventInfo from "@ckeditor/ckeditor5-utils/src/eventinfo";

export default abstract class Plugin<T = void> implements Emitter, Observable {
  readonly editor: Editor;

  static readonly pluginName?: string;
  static readonly requires?: Array<new(editor: Editor) => Plugin>;

  constructor(editor: Editor);

  destroy?(): null | Promise<any>;

  init?(): null | Promise<T>;

  listenTo(
    emitter: Emitter,
    event: string,
    callback: CallbackFunction,
    options?: { priority?: number | PriorityString },
  ): void;

  afterInit?(): null | Promise<T>;

  on(event: string, callback: CallbackFunction, options?: { priority: PriorityString | number }): void;

  off(event: string, callback?: CallbackFunction): void;

  once(event: string, callback: CallbackFunction, options?: { priority: PriorityString | number }): void;

  set(name: string | Object, value?: any): void;

  bind(...bindProperties: any[]): BindReturnValue;

  fire(eventOrInfo: string | EventInfo, ...args: any[]): any;

  stopListening(emitter?: Emitter, event?: string, callback?: CallbackFunction): void;

  decorate(methodName: string): void;
}

// Beware that this defines a class constructor, not the class instance.
export interface PluginInterface<T = Plugin> {
  new(editor: Editor): T;
}
