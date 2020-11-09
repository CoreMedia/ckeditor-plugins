import * as engine from "@ckeditor/ckeditor5-engine";
import * as utils from "@ckeditor/ckeditor5-utils";

export namespace editor {

  class Editor implements utils.Emitter, utils.Observable {
    readonly editing: engine.controller.EditingController;
    readonly plugins: PluginCollection<Plugin<any>>;

    constructor(config?: object);

    on(event: string, callback: Function, options?: { priority: utils.PriorityString | number }): void;
  }

}

export abstract class Plugin<T = void> implements utils.Emitter, utils.Observable {
  readonly editor: editor.Editor;

  static readonly pluginName?: string;
  static readonly requires?: Array<new(editor: editor.Editor) => Plugin>;

  constructor(editor: editor.Editor);
  init?(): null | Promise<T>;
  on(event: string, callback: Function, options?: {priority: utils.PriorityString | number}): void;
}

export class PluginCollection<P extends Plugin<any>> {
  constructor(
    editor: editor.Editor,
    availablePlugins?: Array<new(editor: editor.Editor) => P>
  );

  [Symbol.iterator](): Iterator<[new(editor: editor.Editor) => P, P]>;

  destroy(): Promise<Array<P & {destroy(): void | null | Promise<any>}>>;

  get(
    key: string | (new(editor: editor.Editor) => P)
  ): P | undefined;

  load(
    plugins: Array<string | (new(editor: editor.Editor) => P)>,
    removePlugins?: Array<string | (new(editor: editor.Editor) => P)>
  ): Promise<P[]>;
}
