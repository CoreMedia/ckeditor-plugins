import type { Page } from "playwright-core";
import type {
  InputExampleElement,
  MockContentConfig,
  MockExternalContent,
} from "@coremedia-internal/ckeditor5-coremedia-studio-integration-mock";
import type {
  IsDroppableEvaluationResult,
  IsLinkableEvaluationResult,
} from "@coremedia/ckeditor5-coremedia-studio-integration";
import { EDITOR_TEST_API_GLOBAL } from "@coremedia/ckeditor5-itest-constants";

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
  setReadOnly(enabled: boolean): void;
  getLastOpenedEntities(): Promise<unknown[]>;
  addBlockedWord(word: string): Promise<void>;
  addInputExampleElement(data: InputExampleElement): void;
  validateIsDroppableState(uris: string[]): IsDroppableEvaluationResult | undefined;
  validateIsDroppableInLinkBalloon(uris: string[]): IsLinkableEvaluationResult | undefined;
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

/**
 * Toggles the editor's read-only mode. Replaces `ApplicationWrapper.switchReadOnly`.
 */
export const setReadOnly = (page: Page, enabled: boolean): Promise<void> =>
  page.evaluate(
    ([apiGlobal, value]) => {
      const api = (window as unknown as Record<string, EditorTestApi | undefined>)[apiGlobal];
      if (!api) {
        throw new Error(`Editor test API not available as window.${apiGlobal}. Is the scenario ready?`);
      }
      api.setReadOnly(value);
    },
    [EDITOR_TEST_API_GLOBAL, enabled] as const,
  );

/**
 * Reads the entities most recently triggered to be opened. Replaces
 * `ContentFormServiceWrapper.getLastOpenedEntities`.
 */
export const getLastOpenedEntities = (page: Page): Promise<unknown[]> =>
  page.evaluate((apiGlobal) => {
    const api = (window as unknown as Record<string, EditorTestApi | undefined>)[apiGlobal];
    if (!api) {
      throw new Error(`Editor test API not available as window.${apiGlobal}. Is the scenario ready?`);
    }
    return api.getLastOpenedEntities();
  }, EDITOR_TEST_API_GLOBAL);

/**
 * Pre-registers a blocked word with the mock blocklist service. Replaces
 * `BlocklistServiceWrapper.addWord`.
 */
export const addBlockedWord = (page: Page, word: string): Promise<void> =>
  page.evaluate(
    ([apiGlobal, value]) => {
      const api = (window as unknown as Record<string, EditorTestApi | undefined>)[apiGlobal];
      if (!api) {
        throw new Error(`Editor test API not available as window.${apiGlobal}. Is the scenario ready?`);
      }
      return api.addBlockedWord(value);
    },
    [EDITOR_TEST_API_GLOBAL, word] as const,
  );

/**
 * Creates a draggable input-example element appended to the document body, so
 * it can serve as a drag/paste source. Replaces
 * `MockInputExamplePluginWrapper.addInputExampleElement`.
 */
export const addInputExampleElement = (page: Page, data: InputExampleElement): Promise<void> =>
  page.evaluate(
    ([apiGlobal, element]) => {
      const api = (window as unknown as Record<string, EditorTestApi | undefined>)[apiGlobal];
      if (!api) {
        throw new Error(`Editor test API not available as window.${apiGlobal}. Is the scenario ready?`);
      }
      api.addInputExampleElement(element);
    },
    [EDITOR_TEST_API_GLOBAL, data] as const,
  );

/**
 * Evaluates the droppable state of the given uris in rich text. Replaces
 * `MockInputExamplePluginWrapper.validateIsDroppableState`.
 */
export const validateIsDroppableState = (
  page: Page,
  uris: string[],
): Promise<IsDroppableEvaluationResult | undefined> =>
  page.evaluate(
    ([apiGlobal, data]) => {
      const api = (window as unknown as Record<string, EditorTestApi | undefined>)[apiGlobal];
      if (!api) {
        throw new Error(`Editor test API not available as window.${apiGlobal}. Is the scenario ready?`);
      }
      return api.validateIsDroppableState(data);
    },
    [EDITOR_TEST_API_GLOBAL, uris] as const,
  );

/**
 * Evaluates the droppable state of the given uris in the link balloon. Replaces
 * `MockInputExamplePluginWrapper.validateIsDroppableInLinkBalloon`.
 */
export const validateIsDroppableInLinkBalloon = (
  page: Page,
  uris: string[],
): Promise<IsLinkableEvaluationResult | undefined> =>
  page.evaluate(
    ([apiGlobal, data]) => {
      const api = (window as unknown as Record<string, EditorTestApi | undefined>)[apiGlobal];
      if (!api) {
        throw new Error(`Editor test API not available as window.${apiGlobal}. Is the scenario ready?`);
      }
      return api.validateIsDroppableInLinkBalloon(data);
    },
    [EDITOR_TEST_API_GLOBAL, uris] as const,
  );

export type { EditorTestApi, WindowWithTestApi };
