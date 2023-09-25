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
  readonly #eventsOnce = new Map<string, () => void>();

  protected constructor(config: Record<string, unknown | unknown[]>) {
    // Config should exist first, so that plugins may already access it.
    this.config = new Config(config);
    this.plugins = new PluginCollection(this, config?.plugins as unknown[] | undefined);
    this.instanceId = Editor.#instanceCount++;

    this.plugins.mockInitAll();
    this.fire("ready");
  }

  once(name: string, cb: () => void): void {
    this.#eventsOnce.set(name, cb);
  }

  fire(name: string): void {
    if (this.#eventsOnce.has(name)) {
      this.#eventsOnce.get(name)?.();
      this.#eventsOnce.delete(name);
    }
  }

  toString(): string {
    return `Editor@${this.instanceId}`;
  }
}
