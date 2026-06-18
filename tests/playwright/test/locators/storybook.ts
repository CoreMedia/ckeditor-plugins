import type { Locator, Page } from "playwright-core";

/**
 * Stable selectors aligned with the Storybook scenario container contract.
 *
 * Source of truth: `tests/storybook/src/runtime/mountStory.ts`
 * (`SCENARIO_CONTAINER_CLASS`, `EDITOR_READY_ATTRIBUTE`, `EDITOR_ELEMENT_ID`).
 * Keep these constants in sync with that module.
 */
export const SCENARIO_CONTAINER_CLASS = "storybook-editor-scenario";
export const EDITOR_READY_ATTRIBUTE = "data-editor-ready";
export const EDITOR_ELEMENT_ID = "editor";

/**
 * Locator for the scenario container a story renders.
 */
export const scenarioContainer = (page: Page): Locator => page.locator(`.${SCENARIO_CONTAINER_CLASS}`);

/**
 * Locator for the editor host element the editor is mounted into.
 */
export const editorHost = (page: Page): Locator => page.locator(`#${EDITOR_ELEMENT_ID}`);

/**
 * Locator that only matches once the scenario signalled readiness.
 */
export const readyScenarioContainer = (page: Page): Locator =>
  page.locator(`.${SCENARIO_CONTAINER_CLASS}[${EDITOR_READY_ATTRIBUTE}="true"]`);

/**
 * Waits for the scenario to finish initializing the editor. Replaces the former
 * application readiness wait (`await editor(page).waitFor()` after navigation).
 *
 * @param page - Playwright page
 */
export const waitForScenarioReady = async (page: Page): Promise<void> => {
  await readyScenarioContainer(page).waitFor();
};
