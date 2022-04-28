import Plugin, { PluginInterface } from "@ckeditor/ckeditor5-core/src/plugin";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import Logger from "@coremedia/ckeditor5-logging/logging/Logger";
import LoggerProvider from "@coremedia/ckeditor5-logging/logging/LoggerProvider";

const pluginsLogger: Logger = LoggerProvider.getLogger("Plugins");

/**
 * Error, which signals that a requested plugin could not be found.
 */
export class PluginNotFoundError extends Error {
  readonly #key: PluginInterface;

  constructor(key: PluginInterface, message: string) {
    super(message);
    Object.setPrototypeOf(this, PluginNotFoundError.prototype);
    this.#key = key;
  }

  get key(): PluginInterface {
    return this.#key;
  }

  get name(): string {
    return this.#key.name;
  }
}

/**
 * Error handler, if plugin could not be found.
 */
export type PluginNotFoundErrorHandler = (e: PluginNotFoundError) => void;

/**
 * Suggested alternative `catch` handler, if a plugin is not found.
 * It will trigger a debug log statement.
 *
 * @param e - error to ignore
 */
export const optionalPluginNotFound: PluginNotFoundErrorHandler = (e: PluginNotFoundError) =>
  pluginsLogger.debug(`Optional plugin '${e.name}' not found.`, e);

/**
 * Provides a `catch` handler, if a recommended plugin is not found.
 * It will trigger a warning log statement and a debug log statement with more details.
 * @param effectIfMissingMessage - optional effect, what will happen if the plugin is missing
 * @param logger - optional logger to use instead of default
 */
export const recommendPlugin = (
  effectIfMissingMessage = "",
  logger: Logger = pluginsLogger
): PluginNotFoundErrorHandler => {
  const messageSuffix = effectIfMissingMessage ? ` ${effectIfMissingMessage}` : "";
  return (e) => {
    const message = `Recommended plugin '${e.name}' not found.${messageSuffix}`;
    logger.warn(message);
    logger.debug(`Details on: ${message}`, e);
  };
};

/**
 * Promise, which either resolves immediately to the given plugin or rejects
 * with `Error` if not available.
 *
 * If you refer to a required plugin, skipping `catch` for the promise
 * may be fine. For optional plugins (trigger an action if plugin is available)
 * you may want to use {@link optionalPluginNotFound} as handler, which just
 * logs a debug note on a not existing plugin.
 *
 * @example
 * ```typescript
 * ifPlugin(editor, OptionalPlugin)
 *   .then(...)
 *   .catch(optionalPluginNotFound);
 * ```
 * @param editor - editor to find requested plugin
 * @param key - plugin key
 * @returns `Promise` for requested plugin
 * @throws PluginNotFoundError if plugin could not be found
 */
export const ifPlugin = async <T extends Plugin>(editor: Editor, key: PluginInterface<T>): Promise<T> => {
  if (editor.plugins.has(key)) {
    return editor.plugins.get(key);
  } else {
    throw new PluginNotFoundError(key, `Plugin ${key.name} unavailable.`);
  }
};
