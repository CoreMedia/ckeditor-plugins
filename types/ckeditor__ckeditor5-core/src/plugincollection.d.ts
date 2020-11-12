import Plugin from "./plugin";
import Editor from "./editor/editor";

export default class PluginCollection<P extends Plugin<any>> {
  constructor(
    editor: Editor,
    availablePlugins?: Array<new(editor: Editor) => P>
  );

  [Symbol.iterator](): Iterator<[new(editor: Editor) => P, P]>;

  destroy(): Promise<Array<P & { destroy(): void | null | Promise<any> }>>;

  get(
    key: string | (new(editor: Editor) => P)
  ): P | undefined;

  load(
    plugins: Array<string | (new(editor: Editor) => P)>,
    removePlugins?: Array<string | (new(editor: Editor) => P)>
  ): Promise<P[]>;
}
