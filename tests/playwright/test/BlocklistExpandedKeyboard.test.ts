import { blocklistWordsScenario } from "@coremedia/ckeditor5-itest-constants";
import { expect, test } from "./base";
import { editor } from "./locators/editor";
import { balloonPanel } from "./locators/balloon";
import { openStory } from "./storybook/mountStory";

/**
 * Tests that an expanded selection does not open the blocklist balloon, but the
 * keyboard shortcut (Ctrl/Cmd+Shift+B) reveals all blocked words.
 *
 * Runs against the fully prepared Storybook story
 * `tests-blocklistexpandedkeyboard--default` (see
 * `tests/storybook/stories/tests/BlocklistExpandedKeyboard.stories.ts`): the
 * blocked words and editor data are baked into the story, so the test only opens
 * it and asserts through locators — no `page.evaluate`.
 */
const storyId = "tests-blocklistexpandedkeyboard--default";

test("Blocklist: Expanded selection shows all blocked words on keyboard shortcut", async ({ page }) => {
  await openStory(page, storyId);

  const editable = editor(page);

  // Select the whole text. `ControlOrMeta` resolves to Meta on macOS and
  // Control elsewhere.
  await editable.locator("p", { hasText: blocklistWordsScenario.notBlockedText }).click();
  await page.keyboard.down("ControlOrMeta");
  await page.keyboard.press("a");
  await page.keyboard.up("ControlOrMeta");

  // An expanded selection must not show the blocklist balloon/input.
  const blocklistActionsView = balloonPanel(page).blocklistActionsView;
  await expect(blocklistActionsView.input.locator).toBeHidden();

  // Open the blocklist balloon via the keyboard shortcut (Ctrl/Cmd+Shift+B).
  await page.keyboard.down("ControlOrMeta");
  await page.keyboard.down("Shift");
  await page.keyboard.press("b");
  await page.keyboard.up("Shift");
  await page.keyboard.up("ControlOrMeta");

  await expect(blocklistActionsView.locator).toBeVisible();

  const allBlockedWords = await blocklistActionsView.allBlockedWords;
  expect(allBlockedWords).toHaveLength(2);
  expect(allBlockedWords).toContain(blocklistWordsScenario.blockedWord.toLowerCase());
  expect(allBlockedWords).toContain(blocklistWordsScenario.anotherBlockedWord.toLowerCase());
});
