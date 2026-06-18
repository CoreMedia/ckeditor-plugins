import type { Page } from "playwright-core";
import type {
  MockContentConfig,
  MockExternalContent,
} from "@coremedia-internal/ckeditor5-coremedia-studio-integration-mock";

/**
 * Name of the global the Storybook runtime exposes its in-page editor test API
 * under. Must match `EDITOR_TEST_API_GLOBAL` in
 * `tests/storybook/src/runtime/testApi.ts` (independent copy to avoid a
 * build-time dependency on the Storybook package).
 */
const EDITOR_TEST_API_GLOBAL = "coremediaEditorTestApi";

/**
 * In-page editor test API shape, mirrored from the Storybook runtime. These are
 * the migrated, handle-free replacements for the former `ApplicationWrapper` /
 * `ClassicEditorWrapper` / mock-plugin wrappers. Playwright drives them via
 * {@link Page.evaluate}.
 */
interface EditorTestApi {
  setData(value: string): void;
  getData(): string;
  setDataAndGetDataView(value: string): Promise<string>;
  focus(): void;
  addMockContents(contents: MockContentConfig[]): void;
  addMockExternalContents(contents: MockExternalContent[]): void;
}

type WindowWithTestApi = Window & {
  [EDITOR_TEST_API_GLOBAL]?: EditorTestApi;
};

/**
 * Sets editor data. Replaces `ClassicEditorWrapper.setData`.
 */
export const setEditorData = (page: Page, value: string): Promise<void> =>
  page.evaluate(
    ([apiGlobal, data]) => {
      const api = (window as unknown as Record<string, EditorTestApi | undefined>)[apiGlobal];
      if (!api) {
        throw new Error(`Editor test API not available as window.${apiGlobal}. Is the scenario ready?`);
      }
      api.setData(data);
    },
    [EDITOR_TEST_API_GLOBAL, value] as const,
  );

/**
 * Reads editor data. Replaces `ClassicEditorWrapper.getData`.
 */
export const getEditorData = (page: Page): Promise<string> =>
  page.evaluate((apiGlobal) => {
    const api = (window as unknown as Record<string, EditorTestApi | undefined>)[apiGlobal];
    if (!api) {
      throw new Error(`Editor test API not available as window.${apiGlobal}. Is the scenario ready?`);
    }
    return api.getData();
  }, EDITOR_TEST_API_GLOBAL);

/**
 * Sets data and resolves with the processed _data view_ (richtext only).
 * Replaces `ClassicEditorWrapper.setDataAndGetDataView`.
 */
export const setEditorDataAndGetDataView = (page: Page, value: string): Promise<string> =>
  page.evaluate(
    ([apiGlobal, data]) => {
      const api = (window as unknown as Record<string, EditorTestApi | undefined>)[apiGlobal];
      if (!api) {
        throw new Error(`Editor test API not available as window.${apiGlobal}. Is the scenario ready?`);
      }
      return api.setDataAndGetDataView(data);
    },
    [EDITOR_TEST_API_GLOBAL, value] as const,
  );

/**
 * Focuses the editor. Replaces `EditorWrapper.focus`.
 */
export const focusEditor = (page: Page): Promise<void> =>
  page.evaluate((apiGlobal) => {
    const api = (window as unknown as Record<string, EditorTestApi | undefined>)[apiGlobal];
    if (!api) {
      throw new Error(`Editor test API not available as window.${apiGlobal}. Is the scenario ready?`);
    }
    api.focus();
  }, EDITOR_TEST_API_GLOBAL);

/**
 * Registers mock contents. Replaces `MockContentPluginWrapper.addContents`.
 */
export const addMockContents = (page: Page, ...contents: MockContentConfig[]): Promise<void> =>
  page.evaluate(
    ([apiGlobal, data]) => {
      const api = (window as unknown as Record<string, EditorTestApi | undefined>)[apiGlobal];
      if (!api) {
        throw new Error(`Editor test API not available as window.${apiGlobal}. Is the scenario ready?`);
      }
      api.addMockContents(data);
    },
    [EDITOR_TEST_API_GLOBAL, contents] as const,
  );

/**
 * Registers mock external contents. Replaces
 * `MockExternalContentPluginWrapper.addContents`.
 */
export const addMockExternalContents = (page: Page, contents: MockExternalContent[]): Promise<void> =>
  page.evaluate(
    ([apiGlobal, data]) => {
      const api = (window as unknown as Record<string, EditorTestApi | undefined>)[apiGlobal];
      if (!api) {
        throw new Error(`Editor test API not available as window.${apiGlobal}. Is the scenario ready?`);
      }
      api.addMockExternalContents(data);
    },
    [EDITOR_TEST_API_GLOBAL, contents] as const,
  );

export type { EditorTestApi, WindowWithTestApi };
