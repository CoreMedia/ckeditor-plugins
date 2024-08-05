import { DataFacade } from "../../../src";
import { Editor } from "ckeditor5";
import { Autosave } from "../ckeditor5-autosave";
const byStringKey = (key: string, plugin: unknown): boolean => {
  if (typeof plugin === "function") {
    return plugin.name === key;
  }
  console.debug(`Signal not found searching for ${key} for entry: ${plugin} (${typeof plugin})`);
  return false;
};
const byConstructor = (key: unknown, plugin: unknown): boolean => {
  if (typeof plugin === "function") {
    return key === plugin;
  }
  console.debug(`Signal not found searching for ${key} for entry: ${plugin} (${typeof plugin})`);
  return false;
};
const pluginPredicate =
  (key: unknown) =>
  (plugin: unknown): boolean => {
    if (typeof key === "string") {
      return byStringKey(key, plugin);
    }
    if (typeof key === "function") {
      return byConstructor(key, plugin);
    }
    console.debug(`Unsupported key ${key} of type ${typeof key}. Will signal: Not found.`);
    return false;
  };
export class PluginCollection {
  readonly #context: unknown;
  readonly #plugins: unknown[];
  #dataFacade: DataFacade;
  #autosave: Autosave;
  constructor(context: unknown, availablePlugins: unknown[] = []) {
    this.#context = context;
    this.#plugins = availablePlugins;
  }
  mockInitAll() {
    for (const pluginKey of this.#plugins) {
      const plugin = this.get(pluginKey) as {
        init?: () => void;
      };
      plugin.init?.();
    }
  }
  has(key: unknown): boolean {
    return this.#plugins.some(pluginPredicate(key));
  }
  get(key: unknown): unknown {
    const plugin = this.#plugins.find(pluginPredicate(key));
    if (!plugin) {
      throw new Error(`get: No Plugin registered for key "${key}" (${typeof key}).`);
    }
    if (typeof plugin === "function") {
      // Lazy initialization required, as at construction time, relevant
      // setup in the editor (here: config) may not be available, yet.
      switch (plugin.name) {
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
          throw new Error(`Don't know how to provide instance of: "${plugin.name}"`);
      }
    }
    throw new Error(`get: Mock does not know how to get instance for: "${typeof plugin}".`);
  }
}
