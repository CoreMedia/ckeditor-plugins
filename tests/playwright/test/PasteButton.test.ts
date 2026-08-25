import type { Page } from "playwright-core";
import { pasteButtonScenario } from "@coremedia/ckeditor5-itest-constants";
import { expect, test } from "./base";
import { editor } from "./locators/editor";
import { editorData } from "./locators/outputs";
import { openStory } from "./storybook/mountStory";

const targetSelector = ".ck-toolbar__items";

const copyPaste = async (page: Page, inputElementSelector: string, toolbarItemsLocator: string): Promise<void> => {
  await page.locator(inputElementSelector).waitFor();
  await page.locator(toolbarItemsLocator).waitFor();
  const inputElement = page.locator(inputElementSelector);
  await inputElement.dblclick();
  const pasteContentButton = page.locator(toolbarItemsLocator).locator(".paste-content-button");
  await pasteContentButton.waitFor();
  await pasteContentButton.click();
};

const inputElementSelectorFor = (inputElementClass: string): string =>
  `.input-example.input-content.${inputElementClass}`;

/**
 * Migrated to run against the fully prepared Storybook stories
 * `tests-pastebutton--*` (see
 * `tests/storybook/stories/tests/PasteButton.stories.ts`): each story registers
 * its mock contents and the draggable input-example element and preloads the
 * editor, so the test only opens the matching story and drives the paste
 * through locators — no `page.evaluate`. Image variants expose the editor data
 * via the `editor-data` observable output, read here with the `editorData`
 * locator.
 */
test.describe("Paste Button", () => {
  test.describe("Links", () => {
    const cases = [
      { storyId: "tests-pastebutton--one-link", variant: pasteButtonScenario.oneLink, name: "one link" },
      { storyId: "tests-pastebutton--slow-links", variant: pasteButtonScenario.slowLinks, name: "slow links" },
      {
        storyId: "tests-pastebutton--multiple-links",
        variant: pasteButtonScenario.multipleLinks,
        name: "multiple links",
      },
    ];

    for (const { storyId, variant, name } of cases) {
      test(`Should paste ${name} (non embeddable contents as links).`, async ({ page }) => {
        await openStory(page, storyId);

        const inputElementSelector = inputElementSelectorFor(variant.class);
        await copyPaste(page, inputElementSelector, targetSelector);

        // Validate Editing Downcast
        const linkElements = editor(page).locator("a");
        await expect(linkElements).toHaveCount(variant.contents.length);
        for (let i = 0; i < variant.contents.length; i++) {
          await expect(linkElements.nth(i)).toContainText(variant.contents[i].name);
        }
      });
    }

    test("Should paste a link using keyboard shorcut.", async ({ page }) => {
      const variant = pasteButtonScenario.pasteViaKeyboardLink;
      await openStory(page, "tests-pastebutton--paste-via-keyboard-link");

      const inputElementSelector = inputElementSelectorFor(variant.class);
      await page.locator(inputElementSelector).dblclick();
      await editor(page).click();
      // `ControlOrMeta` resolves to Meta on macOS and Control elsewhere.
      await page.keyboard.press("ControlOrMeta+Shift+P");

      await page.getByRole("link", { name: variant.contents[0].name }).waitFor();
    });
  });

  test.describe("Images", () => {
    const cases = [
      { storyId: "tests-pastebutton--one-image", variant: pasteButtonScenario.oneImage, name: "one image" },
      {
        storyId: "tests-pastebutton--multiple-images",
        variant: pasteButtonScenario.multipleImages,
        name: "multiple images",
      },
      { storyId: "tests-pastebutton--slow-images", variant: pasteButtonScenario.slowImages, name: "slow images" },
    ];

    for (const { storyId, variant, name } of cases) {
      test(`Should paste ${name} (embeddable contents as images).`, async ({ page }) => {
        await openStory(page, storyId);

        // execute paste
        const inputElementSelector = inputElementSelectorFor(variant.class);
        await copyPaste(page, inputElementSelector, targetSelector);

        // Validate Editing Downcast
        for (const contentMock of variant.contents) {
          // noinspection HtmlUnknownAttribute
          await expect
            .poll(() => editorData(page))
            .toContain(`<img xlink:href="content/${contentMock.id}#properties.data" alt=""/>`);
        }

        const images = editor(page).locator("img");
        await expect(images).toHaveCount(variant.contents.length);
        for (let i = 0; i < variant.contents.length; i++) {
          await expect(images.nth(i)).toHaveAttribute("src", variant.contents[i].blob);
          await expect(images.nth(i)).toHaveAttribute("title", variant.contents[i].name);
        }
      });
    }
  });
});
