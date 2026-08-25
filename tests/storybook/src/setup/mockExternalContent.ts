import type { Editor } from "ckeditor5";
import {
  MockExternalContentPlugin,
  type MockExternalContent,
} from "@coremedia-internal/ckeditor5-coremedia-studio-integration-mock";
import { ensurePluginLoaded } from "./plugins";

/**
 * Registers mock external contents with the mock studio backend.
 *
 * In-page replacement for `MockExternalContentPluginWrapper.addContents`.
 *
 * @param editor - live editor instance
 * @param externalContents - external content definitions to register
 */
export const registerMockExternalContents = (editor: Editor, externalContents: MockExternalContent[]): void => {
  ensurePluginLoaded(editor, MockExternalContentPlugin.pluginName);
  editor.plugins.get(MockExternalContentPlugin).addExternalContents(externalContents);
};
