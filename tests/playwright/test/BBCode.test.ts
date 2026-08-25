import { bbCodeScenario } from "@coremedia/ckeditor5-itest-constants";
import { test } from "./base";
import { openStory } from "./storybook/mountStory";

/**
 * Tests the BBCode feature.
 *
 * Runs against the fully prepared Storybook story `tests-bbcode--bold-word`
 * (see `tests/storybook/stories/tests/BBCode.stories.ts`): the bold word is
 * baked into the story data, so the test only opens the story and asserts the
 * rendered `<strong>` through a locator — no `page.evaluate`.
 */
test("BBCode: Should show a bold word as strong-tag", async ({ page }) => {
  await openStory(page, "tests-bbcode--bold-word");
  await page.locator(`strong`, { hasText: bbCodeScenario.boldWord }).waitFor();
});
