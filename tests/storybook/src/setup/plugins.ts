import type { Editor } from "ckeditor5";

/**
 * Ensures the named plugin is loaded in the given editor.
 *
 * This reproduces the helpful "available plugins" error message that the former
 * handle-based wrappers raised, but runs in-page against the real editor
 * instance instead of through a Playwright `JSHandle`.
 *
 * @param editor - editor to check
 * @param pluginName - registered plugin name
 * @throws Error if the plugin is not available
 */
export const ensurePluginLoaded = (editor: Editor, pluginName: string): void => {
  if (!editor.plugins.has(pluginName)) {
    const available = [...editor.plugins]
      .map(([pluginConstructor, plugin]) => pluginConstructor.pluginName ?? `noname:${plugin.constructor.name}`)
      .join(", ");
    throw new Error(`Plugin ${pluginName} not available. Available plugins: ${available}`);
  }
};
