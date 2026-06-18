import { p, richtext } from "@coremedia-internal/ckeditor5-coremedia-example-data";
import { expect, test } from "./base";
import { editor } from "./locators/editor";
import { balloonPanel } from "./locators/balloon";
import { openStory } from "./storybook/mountStory";
import { addBlockedWord, setEditorData } from "./storybook/testApi";

/**
 * Tests the blocklist feature with a collapsed selection.
 *
 * Migrated to run against the Storybook story `tests-blocklistcollapsed--default`
 * (see `tests/storybook/stories/tests/BlocklistCollapsed.stories.ts`) instead of
 * the former example application.
 */
const storyId = "tests-blocklistcollapsed--default";

test("Blocklist: Collapsed selection shows balloon", async ({ page }) => {
  await openStory(page, storyId);

  const blockedWord = "thisisablockedword";
  await addBlockedWord(page, blockedWord);

  const data = richtext(`${p("Hello World!")}${p(blockedWord)}${p("This is an example text for test purposes.")}`);
  await setEditorData(page, data);

  const editable = editor(page);
  const blockedWordMarker = editable.locator(`span[data-blocklist-word]`);
  await expect(blockedWordMarker).toHaveText(blockedWord);

  // `ControlOrMeta` resolves to Meta on macOS and Control elsewhere.
  const modifiers: "ControlOrMeta"[] = ["ControlOrMeta"];
  await blockedWordMarker.click({ modifiers });

  const { input, submitButton } = balloonPanel(page).blocklistActionsView;
  await expect(input.locator).toBeVisible();
  await expect(submitButton.locator).toBeDisabled();
});
