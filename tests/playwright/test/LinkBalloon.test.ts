import type { Page } from "playwright-core";
import { linkBalloonScenario } from "@coremedia/ckeditor5-itest-constants";
import { expect, test } from "./base";
import { editor } from "./locators/editor";
import { balloonPanel } from "./locators/balloon";
import { openStory } from "./storybook/mountStory";

/**
 * Runs against the fully prepared Storybook story `tests-linkballoon--default`
 * (see `tests/storybook/stories/tests/LinkBalloon.stories.ts`): the content link
 * and the helper fixture elements (a draggable element and two "keep the balloon
 * open on click" elements) are baked into the story, so the test only opens it
 * and asserts the balloon close behavior through locators — no `page.evaluate`.
 */
const storyId = "tests-linkballoon--default";

const openLinkBalloon = async (page: Page): Promise<void> => {
  // Open the balloon by clicking the prepared content link.
  await editor(page).locator(`a`, { hasText: linkBalloonScenario.linkText }).click();
};

test.describe("Link Balloon", () => {
  test.beforeEach(async ({ page }) => {
    await openStory(page, storyId);
  });

  test.describe("Close behavior on click on other elements", () => {
    test("Should stay open when click on configured element id or element class", async ({ page }) => {
      await openLinkBalloon(page);

      const { linkToolbarView } = balloonPanel(page);
      // The balloon should pop up on click.
      await expect(linkToolbarView.locator).toBeVisible();

      await page.locator(`#${linkBalloonScenario.keepOpenElementId}`).click();
      await expect(linkToolbarView.locator).toBeVisible();

      await page.locator(`.${linkBalloonScenario.keepOpenElementClass}`).click();
      await expect(linkToolbarView.locator).toBeVisible();
    });

    test("Should close when click on draggable element", async ({ page }) => {
      await openLinkBalloon(page);

      const { linkToolbarView } = balloonPanel(page);
      // The balloon should pop up on click.
      await expect(linkToolbarView.locator).toBeVisible();

      await page.locator(`#${linkBalloonScenario.draggableElementId}`).click();
      await expect(linkToolbarView.locator).toBeHidden();
    });

    test("Should stay open when mousedown on draggable element", async ({ page }) => {
      await openLinkBalloon(page);

      const { linkToolbarView } = balloonPanel(page);
      // The balloon should pop up on click.
      await expect(linkToolbarView.locator).toBeVisible();

      await page.locator(`#${linkBalloonScenario.draggableElementId}`).hover();
      await page.mouse.down();
      await expect(linkToolbarView.locator).toBeVisible();
    });
  });
});
