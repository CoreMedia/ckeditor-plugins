import { blocklistWordsScenario } from "@coremedia/ckeditor5-itest-constants";
import { expect, test } from "./base";
import { editor } from "./locators/editor";
import { balloonPanel } from "./locators/balloon";
import { openStory } from "./storybook/mountStory";

/**
 * Tests the blocklist feature with a collapsed selection.
 *
 * Runs against the fully prepared Storybook story
 * `tests-blocklistcollapsed--default` (see
 * `tests/storybook/stories/tests/BlocklistCollapsed.stories.ts`): the blocked
 * word and editor data are baked into the story, so the test only opens it and
 * asserts through locators — no `page.evaluate`.
 */
const storyId = "tests-blocklistcollapsed--default";

test("Blocklist: Collapsed selection shows balloon", async ({ page }) => {
  await openStory(page, storyId);

  const editable = editor(page);
  const blockedWordMarker = editable.locator(`span[data-blocklist-word]`);
  await expect(blockedWordMarker).toHaveText(blocklistWordsScenario.blockedWord);

  // `ControlOrMeta` resolves to Meta on macOS and Control elsewhere.
  const modifiers: "ControlOrMeta"[] = ["ControlOrMeta"];
  await blockedWordMarker.click({ modifiers });

  const { input, submitButton } = balloonPanel(page).blocklistActionsView;
  await expect(input.locator).toBeVisible();
  await expect(submitButton.locator).toBeDisabled();
});
