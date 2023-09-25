import { DataFacade } from "../../../src";
import { Editor } from "@ckeditor/ckeditor5-core";
import { Autosave } from "../ckeditor5-autosave";

export class PluginCollection {
  readonly #context: unknown;
  readonly #plugins: unknown[];
  #dataFacade?: DataFacade;
  #autosave?: Autosave;

  constructor(context: unknown, availablePlugins: unknown[] = []) {
    this.#context = context;
    this.#plugins = availablePlugins;
  }

  mockInitAll() {
    for (const pluginKey of this.#plugins) {
      const plugin = this.get(pluginKey) as { init?: () => void };
      plugin.init?.();
    }
  }

  has(key: unknown): boolean {
    return this.#plugins.includes(key);
  }

  get(key: unknown): unknown {
    if (this.has(key)) {
      if (typeof key === "function") {
        // Lazy initialization required, as at construction time, relevant
        // setup in the editor (here: config) may not be available, yet.
        switch (key.name) {
          case "DataFacade":
            if (!this.#dataFacade) {
              this.#dataFacade = new DataFacade(this.#context as Editor);
            }
            return this.#dataFacade;
          case "Autosave":
            if (!this.#autosave) {
              this.#autosave = new Autosave(this.#context);
            }
            return this.#autosave;
          default:
            throw new Error(`Don't know how to provide instance of: "${key.name}"`);
        }
      }
      throw new Error(`get: Mock does not know how to get instance for: "${key}.`);
    }
    throw new Error(`get: No Plugin registered for key "${key}" (${typeof key}).`);
  }
}
