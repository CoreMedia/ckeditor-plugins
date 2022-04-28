import Plugin, { PluginInterface } from "@ckeditor/ckeditor5-core/src/plugin";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import Logger from "@coremedia/ckeditor5-logging/logging/Logger";
import LoggerProvider from "@coremedia/ckeditor5-logging/logging/LoggerProvider";

const logger: Logger = LoggerProvider.getLogger("Plugins");

/**
 * Suggested alternative `catch` handler, if a plugin is not found.
 * It will trigger a debug log statement.
 *
 * @param e - error to ignore
 */
export const optionalPluginNotFound = (e: Error) => logger.debug("Optional plugin not found.", e);

/**
 * Promise, which either resolves immediately to the given plugin or rejects
 * with `Error` if not available.
 *
 * @param editor - editor to find requested plugin
 * @param key - plugin key
 * @returns `Promise` for requested plugin
 */
export const ifPlugin = async <T extends Plugin>(editor: Editor, key: PluginInterface<T>): Promise<T> => {
  if (editor.plugins.has(key)) {
    return editor.plugins.get(key);
  } else {
    throw new Error(`Plugin ${key.name} unavailable.`);
  }
};
