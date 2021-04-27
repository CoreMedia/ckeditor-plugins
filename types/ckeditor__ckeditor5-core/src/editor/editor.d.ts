import EditingController from "@ckeditor/ckeditor5-engine/src/controller/editingcontroller";
import DataController from "@ckeditor/ckeditor5-engine/src/controller/datacontroller";

import Emitter from "@ckeditor/ckeditor5-utils/src/emittermixin"
import Observable, { BindReturnValue } from "@ckeditor/ckeditor5-utils/src/observablemixin"
import { PriorityString } from "@ckeditor/ckeditor5-utils/src/priorities"

import PluginCollection from "../plugincollection";
import Plugin from "../plugin";
import Config from "@ckeditor/ckeditor5-utils/src/config";
import Locale from "@ckeditor/ckeditor5-utils/src/locale";
import CommandCollection from "../commandcollection";
import Model from "@ckeditor/ckeditor5-engine/src/model/model";

export default class Editor implements Emitter, Observable {
  readonly commands: CommandCollection;
  readonly config: Config;
  readonly data: DataController;
  readonly editing: EditingController;
  isReadOnly: boolean;
  readonly locale: Locale;
  readonly model: Model;
  readonly plugins: PluginCollection<Plugin<any>>;

  static builtinPlugins: Array<Plugin<any>>;
  static defaultConfig: object;

  constructor(config?: object);

  on(event: string, callback: Function, options?: { priority: PriorityString | number }): void;

  once(event: string, callback: Function, options?: { priority: PriorityString | number }): void;

  set(name: string | Object, value?: any): void;

  bind(...bindProperties: any[]): BindReturnValue;
}
