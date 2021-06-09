import EditingController from "@ckeditor/ckeditor5-engine/src/controller/editingcontroller";
import DataController from "@ckeditor/ckeditor5-engine/src/controller/datacontroller";

import Emitter, { CallbackFunction } from "@ckeditor/ckeditor5-utils/src/emittermixin"
import Observable, { BindReturnValue } from "@ckeditor/ckeditor5-utils/src/observablemixin"
import { PriorityString } from "@ckeditor/ckeditor5-utils/src/priorities"

import PluginCollection from "../plugincollection";
import Plugin from "../plugin";
import Config from "@ckeditor/ckeditor5-utils/src/config";
import Locale from "@ckeditor/ckeditor5-utils/src/locale";
import CommandCollection from "../commandcollection";
import Model from "@ckeditor/ckeditor5-engine/src/model/model";
import Conversion from "@ckeditor/ckeditor5-engine/src/conversion/conversion";
import EventInfo from "@ckeditor/ckeditor5-utils/src/eventinfo";
import DomEventData from "@ckeditor/ckeditor5-engine/src/view/observer/domeventdata";

// TODO[typing]
type EditorConfig = any;
// TODO[typing]
type EditingKeystrokeHandler = any;
// TODO[typing]
type LoadedPlugins = any;

export default abstract class Editor implements Emitter, Observable {
  readonly commands: CommandCollection;
  readonly config: Config;
  readonly conversion: Conversion;
  readonly data: DataController;
  readonly editing: EditingController;
  isReadOnly: boolean;
  readonly keystrokes: EditingKeystrokeHandler;
  readonly locale: Locale;
  readonly model: Model;
  readonly plugins: PluginCollection<Plugin<any>>;

  static builtinPlugins: Array<Plugin<any>>;
  static defaultConfig: object;

  constructor(config?: EditorConfig);

  destroy(): Promise<void>;

  execute(...args: any[]): any;

  initPlugins(): Promise<LoadedPlugins>;

  on(event: string, callback: CallbackFunction, options?: { priority: PriorityString | number }): void;

  off(event: string, callback?: CallbackFunction): void;

  once(event: string, callback: CallbackFunction, options?: { priority: PriorityString | number }): void;

  set(name: string | Object, value?: any): void;

  bind(...bindProperties: any[]): BindReturnValue;

  fire(eventOrInfo: string | EventInfo, ...args: any[]): any;

  stopListening(emitter?: Emitter, event?: string, callback?: (info: EventInfo, data: DomEventData) => void): void;
}
