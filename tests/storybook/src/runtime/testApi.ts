import type { ClassicEditor } from "ckeditor5";
import type {
  MockContentConfig,
  MockExternalContent,
} from "@coremedia-internal/ckeditor5-coremedia-studio-integration-mock";
import { getEditorData, setDataAndGetDataView, setEditorData, focusEditor } from "../setup/editorData";
import { registerMockContents } from "../setup/mockContent";
import { registerMockExternalContents } from "../setup/mockExternalContent";

/**
 * Name of the global property the editor test API is exposed under. Playwright
 * tests reach the migrated, in-page scenario utilities through this object via
 * `page.evaluate`, replacing the former JS-handle wrappers (`ApplicationWrapper`,
 * `ClassicEditorWrapper`, `MockContentPluginWrapper`, ...).
 *
 * This name is part of the contract shared with the Playwright package
 * (`tests/playwright/test/storybook/testApi.ts`). Keep both in sync.
 */
export const EDITOR_TEST_API_GLOBAL = "coremediaEditorTestApi";

/**
 * In-page test API exposed on `window` once a scenario's editor is ready. Each
 * method operates on the live editor instance, so Playwright no longer needs
 * handle-based wrappers to drive the editor.
 */
export interface EditorTestApi {
  /**
   * Sets editor data. Replaces `ClassicEditorWrapper.setData`.
   */
  setData(value: string): void;
  /**
   * Reads editor data. Replaces `ClassicEditorWrapper.getData`.
   */
  getData(): string;
  /**
   * Sets data and resolves with the processed _data view_ (richtext only).
   * Replaces `ClassicEditorWrapper.setDataAndGetDataView`.
   */
  setDataAndGetDataView(value: string): Promise<string>;
  /**
   * Focuses the editor. Replaces `EditorWrapper.focus`.
   */
  focus(): void;
  /**
   * Registers mock contents. Replaces `MockContentPluginWrapper.addContents`.
   */
  addMockContents(contents: MockContentConfig[]): void;
  /**
   * Registers mock external contents. Replaces
   * `MockExternalContentPluginWrapper.addContents`.
   */
  addMockExternalContents(contents: MockExternalContent[]): void;
}

declare global {
  interface Window {
    [EDITOR_TEST_API_GLOBAL]?: EditorTestApi;
  }
}

/**
 * Builds the in-page test API bound to a concrete editor instance.
 *
 * @param editor - live editor instance
 */
export const createEditorTestApi = (editor: ClassicEditor): EditorTestApi => ({
  setData: (value) => setEditorData(editor, value),
  getData: () => getEditorData(editor),
  setDataAndGetDataView: (value) => setDataAndGetDataView(editor, value),
  focus: () => focusEditor(editor),
  addMockContents: (contents) => registerMockContents(editor, ...contents),
  addMockExternalContents: (contents) => registerMockExternalContents(editor, contents),
});

/**
 * Exposes the test API on `window` so Playwright can access it.
 *
 * @param editor - live editor instance
 */
export const installEditorTestApi = (editor: ClassicEditor): void => {
  window[EDITOR_TEST_API_GLOBAL] = createEditorTestApi(editor);
};
