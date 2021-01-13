import EditingController from "@ckeditor/ckeditor5-engine/src/controller/editingcontroller";
import DataController from "@ckeditor/ckeditor5-engine/src/controller/datacontroller";

import Emitter from "@ckeditor/ckeditor5-utils/src/emittermixin"
import Observable from "@ckeditor/ckeditor5-utils/src/observablemixin"
import { PriorityString } from "@ckeditor/ckeditor5-utils/src/priorities"

import PluginCollection from "../plugincollection";
import Plugin from "../plugin";
import Config from "@ckeditor/ckeditor5-utils/src/config";

export default class Editor implements Emitter, Observable {
  readonly config: Config;
  readonly data: DataController;
  readonly editing: EditingController;
  readonly plugins: PluginCollection<Plugin<any>>;

  constructor(config?: object);

  on(event: string, callback: Function, options?: { priority: PriorityString | number }): void;
}
