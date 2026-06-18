import { editor } from "./locators/editor";
import { test } from "./base";
import { openStory } from "./storybook/mountStory";

/**
 * Migrated to run against the Storybook story `tests-application--default`
 * (see `tests/storybook/stories/tests/Application.stories.ts`) instead of the
 * former example application.
 */
test("Application should be available", async ({ page }) => {
  await openStory(page, "tests-application--default");
  await editor(page).waitFor();
});
