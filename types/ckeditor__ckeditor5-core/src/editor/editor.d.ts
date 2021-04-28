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

export default class Editor implements Emitter, Observable {
  get commands(): CommandCollection;

  get config(): Config;

  get conversion(): Conversion;

  get data(): DataController;

  get editing(): EditingController;

  get isReadOnly(): boolean;

  get locale(): Locale;

  get model(): Model;

  get plugins(): PluginCollection<Plugin<any>>;

  static builtinPlugins: Array<Plugin<any>>;
  static defaultConfig: object;

  constructor(config?: object);

  on(event: string, callback: CallbackFunction, options?: { priority: PriorityString | number }): void;

  once(event: string, callback: CallbackFunction, options?: { priority: PriorityString | number }): void;

  set(name: string | Object, value?: any): void;

  bind(...bindProperties: any[]): BindReturnValue;
}
