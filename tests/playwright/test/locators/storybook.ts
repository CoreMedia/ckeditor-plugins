import type { Locator, Page } from "playwright-core";
import {
  EDITOR_ELEMENT_ID,
  EDITOR_READY_ATTRIBUTE,
  OVERLAY_HOST_CLASS,
  SCENARIO_CONTAINER_CLASS,
  SHADOW_HOST_CLASS,
} from "@coremedia/ckeditor5-itest-constants";

export { EDITOR_ELEMENT_ID, EDITOR_READY_ATTRIBUTE, OVERLAY_HOST_CLASS, SCENARIO_CONTAINER_CLASS, SHADOW_HOST_CLASS };

/**
 * Locator for the scenario container a story renders.
 */
export const scenarioContainer = (page: Page): Locator => page.locator(`.${SCENARIO_CONTAINER_CLASS}`);

/**
 * Locator for the editor host element the editor is mounted into.
 */
export const editorHost = (page: Page): Locator => page.locator(`#${EDITOR_ELEMENT_ID}`);

/**
 * Locator for the shadow host of a scenario mounted with `shadowDom: true`.
 * Playwright CSS locators pierce open shadow roots, so locators chained from
 * this one match elements inside its shadow root.
 */
export const shadowHost = (page: Page): Locator => page.locator(`.${SHADOW_HOST_CLASS}`);

/**
 * Locator for the host of the overlay container (`config.ui.overlayContainer`)
 * of a scenario mounted with `shadowDom: true`. CKEditor's floating UI
 * (balloons, tooltips) renders inside its shadow root.
 */
export const overlayHost = (page: Page): Locator => page.locator(`.${OVERLAY_HOST_CLASS}`);

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
