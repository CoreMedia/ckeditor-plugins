import type { Page } from "playwright-core";
import { waitForScenarioReady } from "../locators/storybook";
import { storyUrl } from "./environment";

/**
 * Navigates to a Storybook story preview and waits until its editor scenario
 * signalled readiness (`data-editor-ready="true"`).
 *
 * This is the migrated replacement for the former pattern:
 * `await page.goto(applicationUrl); await editor(page).waitFor();`
 *
 * @param page - Playwright page
 * @param storyId - stable story id (for example `tests-helloeditor--default`)
 */
export const openStory = async (page: Page, storyId: string): Promise<void> => {
  await page.goto(storyUrl(storyId));
  await waitForScenarioReady(page);
};
