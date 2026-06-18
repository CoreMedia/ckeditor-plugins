import { p, richtext } from "@coremedia-internal/ckeditor5-coremedia-example-data";
import { expect, test } from "./base";
import { editor } from "./locators/editor";
import { balloonPanel } from "./locators/balloon";
import { openStory } from "./storybook/mountStory";
import { addBlockedWord, setEditorData } from "./storybook/testApi";

/**
 * Tests that an expanded selection does not open the blocklist balloon, but the
 * toolbar button opens it and reveals all blocked words.
 *
 * Migrated to run against the Storybook story
 * `tests-blocklistexpandedtoolbar--default` (see
 * `tests/storybook/stories/tests/BlocklistExpandedToolbar.stories.ts`) instead
 * of the former example application.
 */
const storyId = "tests-blocklistexpandedtoolbar--default";

test("Blocklist: Expanded selection shows all blocked words via toolbar button", async ({ page }) => {
  await openStory(page, storyId);

  const notBlocked = "Hello World!";
  const blockedWord = "thisisablockedword";
  const anotherBlockedWord = "anotherBlockedWord";

  await addBlockedWord(page, blockedWord);
  await addBlockedWord(page, anotherBlockedWord);

  const data = richtext(
    `${p(notBlocked)}${p(`${blockedWord},${anotherBlockedWord}`)}${p("This is an example text for test purposes.")}`,
  );
  await setEditorData(page, data);

  const editable = editor(page);

  // Select the whole text. `ControlOrMeta` resolves to Meta on macOS and
  // Control elsewhere.
  await editable.locator("p", { hasText: notBlocked }).click();
  await page.keyboard.down("ControlOrMeta");
  await page.keyboard.press("a");
  await page.keyboard.up("ControlOrMeta");

  // An expanded selection must not show the blocklist balloon/input.
  const blocklistActionsView = balloonPanel(page).blocklistActionsView;
  await expect(blocklistActionsView.input.locator).toBeHidden();

  // Open the blocklist balloon via the toolbar button.
  await page.locator(".ck-toolbar__items").locator(".open-blocklist").click();

  await expect(blocklistActionsView.locator).toBeVisible();

  const allBlockedWords = await blocklistActionsView.allBlockedWords;
  expect(allBlockedWords).toHaveLength(2);
  expect(allBlockedWords).toContain(blockedWord.toLowerCase());
  expect(allBlockedWords).toContain(anotherBlockedWord.toLowerCase());
});
