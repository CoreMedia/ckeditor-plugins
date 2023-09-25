import { PluginCollection } from "./plugincollection";
import { DataController, Model } from "../ckeditor5-engine";
import { Config } from "../ckeditor5-utils";

export abstract class Editor {
  static #instanceCount = 0;
  readonly instanceId: number;
  readonly plugins: PluginCollection;
  readonly model = new Model();
  readonly data = new DataController(this.model);
  readonly config;

  protected constructor(config: Record<string, unknown | unknown[]>) {
    this.plugins = new PluginCollection(this, config?.plugins as unknown[] | undefined);
    this.config = new Config(config);
    this.instanceId = Editor.#instanceCount++;
  }

  toString(): string {
    return `Editor@${this.instanceId}`;
  }
}
