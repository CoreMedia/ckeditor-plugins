import { PluginCollection } from "./plugincollection";
import { DataController, Model } from "../ckeditor5-engine";
import { Config } from "../ckeditor5-utils";

/**
 * Some extra configuration you may apply to control mocking behavior.
 * Will be passed with "mock" configuration key.
 */
interface MockConfig {
  /**
   * If given, will delay the initialization of plugins and subsequent
   * `"ready"` event until the provided promise got resolved.
   */
  initDelay?: Promise<void>;
}

export abstract class Editor {
  static #instanceCount = 0;
  readonly instanceId: number;
  readonly plugins: PluginCollection;
  readonly model = new Model();
  readonly data = new DataController(this.model);
  readonly config;
  readonly #eventsOnce = new Map<string, () => void>();

  protected constructor(config?: Record<string, unknown | unknown[]>) {
    // Config should exist first, so that plugins may already access it.
    this.config = new Config(config ?? {});
    this.plugins = new PluginCollection(this, config?.plugins as unknown[] | undefined);
    this.instanceId = Editor.#instanceCount++;

    let delayInit = false;

    // Some special mock behavior configuration.
    if (config?.hasOwnProperty("mock")) {
      const mockConfig = config.mock as MockConfig;
      if (mockConfig.initDelay) {
        delayInit = true;
        // Let init be controlled from within the test.
        void mockConfig.initDelay.then(() => this.mockInit());
      }
    }

    if (!delayInit) {
      this.mockInit();
    }
  }

  mockInit(): void {
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
