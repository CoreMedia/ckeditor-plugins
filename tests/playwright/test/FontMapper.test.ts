import type { Page } from "playwright-core";
import { expect, test } from "./base";
import { editor } from "./locators/editor";
import { openStory } from "./storybook/mountStory";
import { editorData } from "./locators/outputs";

/**
 * Selects all content in the currently focused element and replaces it by
 * pasting from the clipboard.
 *
 * Port of the former `ReplaceAllPasteAction.execute`. Uses Playwright's
 * `"ControlOrMeta"` modifier instead of user-agent sniffing.
 *
 * @param page - page under test
 */
const replaceAllPaste = async (page: Page): Promise<void> => {
  const { keyboard } = page;
  const press = (key: string): Promise<unknown> => Promise.all([keyboard.down(key), keyboard.up(key)]);
  await Promise.all([keyboard.down("ControlOrMeta"), press("a"), press("v"), keyboard.up("ControlOrMeta")]);
};

/**
 * Runs against the fully prepared Storybook stories under `Tests/FontMapper`
 * (see `tests/storybook/stories/tests/FontMapper.stories.ts`). Each story bakes
 * a Word-document HTML payload and, while mounting, writes it to the browser
 * clipboard. The test therefore neither reads any HTML fixture nor calls
 * `page.evaluate`: it only focuses the editor via a locator click, pastes, and
 * asserts the FontMapper-mapped content through the `editor-data` observable
 * output.
 */
const wordDocumentStories = [
  { label: "word-template", storyId: "tests-fontmapper--word-template" },
  { label: "word-template-table", storyId: "tests-fontmapper--word-template-table" },
  {
    label: "word-template-table-inherit-font",
    storyId: "tests-fontmapper--word-template-table-inherit-font",
  },
];

test.describe("Font Mapper features", () => {
  /**
   * Test for the FontMapper Plugin.
   *
   * The FontMapper Plugin replaces characters for the Symbol-Font (or a
   * configured font) to be displayable in the browser.
   *
   * Each story holds a Word-document in HTML with the Symbol-font input
   * character already on the clipboard; pasting it must yield the mapped
   * symbol-character.
   */
  for (const { label, storyId } of wordDocumentStories) {
    test(`Should render ∃ when pasted from word document ${label}`, async ({ page }) => {
      const expected = "∃";
      await openStory(page, storyId);

      await editor(page).click();
      await replaceAllPaste(page);

      /*
       * -----------------------------------------------------------------------
       * Validating that the symbol is replaced by the FontMapper plugin.
       * -----------------------------------------------------------------------
       */
      await expect.poll(() => editorData(page)).toContain(expected);
    });
  }
});
