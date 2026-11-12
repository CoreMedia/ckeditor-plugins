import { helloEditorScenario } from "@coremedia/ckeditor5-itest-constants";
import { expect, test } from "./base";
import { editor } from "./locators/editor";
import { openStory } from "./storybook/mountStory";
import { editorData } from "./locators/outputs";

/**
 * Provides some first tests mainly for demonstration purpose.
 *
 * Migrated to run against fully prepared Storybook stories
 * (`tests/storybook/stories/tests/HelloEditor.stories.ts`): each test opens the
 * story prepared for it and interacts/asserts through Playwright locators only,
 * without `page.evaluate`. Values read back from the editor are exposed by the
 * story as observable DOM outputs (see `editor-data`). The literals baked into
 * those stories are shared via `@coremedia/ckeditor5-itest-constants`
 * (`helloEditorScenario`).
 */

test.describe("Hello Editor", () => {
  test("Should expose empty data for an empty editor.", async ({ page }) => {
    await openStory(page, "tests-helloeditor--cleared");
    await expect.poll(() => editorData(page)).toBe("");
  });

  test("Should initially load with some welcome text rendered.", async ({ page }) => {
    await openStory(page, "tests-helloeditor--welcome");
    // In editing view the welcome text is rendered into a `h1` heading.
    await editor(page).locator("h1", { hasText: "CoreMedia" }).waitFor();
  });

  test("Should render external links.", async ({ page }) => {
    await openStory(page, "tests-helloeditor--external-link");
    const externalLink = editor(page).locator("a", { hasText: helloEditorScenario.externalLinkText });
    await expect(externalLink).toHaveAttribute("href", helloEditorScenario.externalLinkTarget);
  });

  test("Should render internal links.", async ({ page }) => {
    await openStory(page, "tests-helloeditor--internal-link");
    // For internal links there is no href representation in the view; the
    // reference only exists on the model layer, so the rendered href is `#`.
    const internalLink = editor(page).locator("a", { hasText: helloEditorScenario.internalLinkText });
    await expect(internalLink).toHaveAttribute("href", "#");
  });
});
