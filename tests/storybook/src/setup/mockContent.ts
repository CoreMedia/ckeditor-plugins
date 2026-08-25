import type { Editor } from "ckeditor5";
import {
  MockContentPlugin,
  type MockContentConfig,
} from "@coremedia-internal/ckeditor5-coremedia-studio-integration-mock";
import { ensurePluginLoaded } from "./plugins";

/**
 * Registers mock contents with the mock studio backend.
 *
 * In-page replacement for `MockContentPluginWrapper.addContents`: instead of
 * reaching into the editor via a Playwright handle, the story calls the plugin
 * directly on the live editor instance.
 *
 * @param editor - live editor instance
 * @param contents - content definitions to register
 */
export const registerMockContents = (editor: Editor, ...contents: MockContentConfig[]): void => {
  ensurePluginLoaded(editor, MockContentPlugin.pluginName);
  editor.plugins.get(MockContentPlugin).addContents(...contents);
};
