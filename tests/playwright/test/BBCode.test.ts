import { editor } from "./locators/editor";
import { test } from "./base";
import { openStory } from "./storybook/mountStory";
import { setEditorData } from "./storybook/testApi";

/**
 * Tests the BBCode feature.
 *
 * Migrated to run against the Storybook story `tests-bbcode--default`
 * (see `tests/storybook/stories/tests/BBCode.stories.ts`) instead of the former
 * example application. Data is set at runtime through the in-page editor test
 * API.
 */
test("BBCode: Should show a bold word as strong-tag", async ({ page }) => {
  await openStory(page, "tests-bbcode--default");
  await editor(page).waitFor();
  await setEditorData(page, "[b]boldword[/b]");
  await page.locator(`strong`, { hasText: "boldword" }).waitFor();
});
