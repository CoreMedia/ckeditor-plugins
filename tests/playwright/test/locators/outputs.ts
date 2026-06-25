import type { Locator, Page } from "playwright-core";
import { OUTPUT_TEST_IDS } from "@coremedia/ckeditor5-itest-constants";

const outputLocator = (page: Page, testId: string): Locator => page.locator(`[data-test="${testId}"]`);

const outputText = async (page: Page, testId: string): Promise<string> => {
  const text = await outputLocator(page, testId).textContent();
  return text ?? "";
};

const outputJson = async <T>(page: Page, testId: string): Promise<T> => {
  const text = await outputText(page, testId);
  return JSON.parse(text) as T;
};

/**
 * Locator for the live editor-data output (`editor-data` harness output).
 */
export const editorDataOutput = (page: Page): Locator => outputLocator(page, OUTPUT_TEST_IDS["editor-data"]);

/**
 * Reads the current editor data from the `editor-data` harness output.
 */
export const editorData = (page: Page): Promise<string> => outputText(page, OUTPUT_TEST_IDS["editor-data"]);

/**
 * Locator for the processed data-view output (`data-view` harness output).
 */
export const dataViewOutput = (page: Page): Locator => outputLocator(page, OUTPUT_TEST_IDS["data-view"]);

/**
 * Reads the processed data view from the `data-view` harness output.
 */
export const dataView = (page: Page): Promise<string> => outputText(page, OUTPUT_TEST_IDS["data-view"]);

/**
 * Reads the entities most recently opened, from the `last-opened-entities`
 * harness output.
 */
export const lastOpenedEntities = (page: Page): Promise<unknown[]> =>
  outputJson<unknown[]>(page, OUTPUT_TEST_IDS["last-opened-entities"]);

/**
 * Reads the rich-text dropability evaluation from the `is-droppable-state`
 * harness output. Resolves `null` while the evaluation is still pending.
 */
export const isDroppableState = <T = unknown>(page: Page): Promise<T | null> =>
  outputJson<T | null>(page, OUTPUT_TEST_IDS["is-droppable-state"]);

/**
 * Reads the link-balloon dropability evaluation from the
 * `is-droppable-in-link-balloon` harness output. Resolves `null` while the
 * evaluation is still pending.
 */
export const isDroppableInLinkBalloon = <T = unknown>(page: Page): Promise<T | null> =>
  outputJson<T | null>(page, OUTPUT_TEST_IDS["is-droppable-in-link-balloon"]);
