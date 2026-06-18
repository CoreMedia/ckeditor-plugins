import { a, p, richtext } from "@coremedia-internal/ckeditor5-coremedia-example-data";
import { contentUriPath } from "@coremedia/ckeditor5-coremedia-studio-integration";
import { expect, test } from "./base";
import { editor } from "./locators/editor";
import { openStory } from "./storybook/mountStory";
import { addMockContents, getEditorData, setEditorData } from "./storybook/testApi";

/**
 * Provides some first test mainly for demonstration purpose of the test API.
 *
 * Migrated to run against the Storybook story `tests-helloeditor--default`
 * (see `tests/storybook/stories/tests/HelloEditor.stories.ts`) instead of the
 * former example application. Editor interaction goes through the in-page
 * editor test API (`./storybook/testApi`) rather than handle-based wrappers.
 */
const storyId = "tests-helloeditor--default";

test.describe("Hello Editor", () => {
  test.beforeEach(async ({ page }) => {
    await openStory(page, storyId);
  });

  test("Should update data when cleared.", async ({ page }) => {
    await setEditorData(page, "");
    await expect.poll(() => getEditorData(page)).toBe("");
  });

  test("Should initially load with some welcome text rendered.", async ({ page }) => {
    // In editing view the welcome text is rendered into a `h1` heading.
    await editor(page).locator("h1", { hasText: "CoreMedia" }).waitFor();
  });

  test("Should render external links.", async ({ page }, testInfo) => {
    const name = testInfo.title;
    const editable = editor(page);

    const linkTarget = "https://example.org";
    const data = richtext(p(a(name, { "xlink:href": linkTarget })));
    await setEditorData(page, data);

    // Match: We cannot fully match `<a href=...>`, as CKEditor may add classes
    // for display purpose to the UI. Nevertheless, this serves as example, how
    // we may test the rendered editing view.
    await expect.poll(() => editable.innerHTML()).toContain(` href="${linkTarget}">${name}</a>`);
  });

  test("Should render internal links.", async ({ page }, testInfo) => {
    const name = testInfo.title;
    const editable = editor(page);

    const id = 42;
    await addMockContents(page, {
      id,
      name: `Document for test ${name}`,
    });

    const dataLink = contentUriPath(id);
    const data = richtext(p(a(name, { "xlink:href": dataLink })));
    await setEditorData(page, data);

    // Match: We cannot fully match `<a href=...>`, as CKEditor may add classes
    // for display purpose to the UI. Nevertheless, this serves as example, how
    // we may test the rendered editing view.
    //
    // `#`: For internal links, there is no representation in view. The reference
    // only exists on model layer.
    await expect.poll(() => editable.innerHTML()).toContain(` href="#">${name}</a>`);
  });
});
