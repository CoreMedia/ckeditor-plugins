import Plugin, { PluginInterface } from "@ckeditor/ckeditor5-core/src/plugin";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";

/**
 * Promise, which either resolves immediately to the given plugin or rejects
 * with `Error` if not available.
 *
 * @param editor - editor to find requested plugin
 * @param key - plugin key
 * @returns `Promise` for requested plugin
 */
export const ifPlugin = <T extends Plugin>(editor: Editor, key: PluginInterface<T>): Promise<T> => {
  return new Promise<T>((resolve, reject) => {
    if (editor.plugins.has(key)) {
      resolve(editor.plugins.get(key));
    } else {
      reject(new Error(`Plugin ${key.name} unavailable.`));
    }
  });
};
