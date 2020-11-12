import EditingController from "@ckeditor/ckeditor5-engine/src/controller/editingcontroller";

import Emitter from "@ckeditor/ckeditor5-utils/src/emittermixin"
import Observable from "@ckeditor/ckeditor5-utils/src/observablemixin"
import {PriorityString} from "@ckeditor/ckeditor5-utils/src/priorities"

import PluginCollection from "../plugincollection";
import Plugin from "../plugin";

export default class Editor implements Emitter, Observable {
  readonly editing: EditingController;
  readonly plugins: PluginCollection<Plugin<any>>;

  constructor(config?: object);

  on(event: string, callback: Function, options?: { priority: PriorityString | number }): void;
}
