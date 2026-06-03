import { a, p, richtext } from "@coremedia-internal/ckeditor5-coremedia-example-data";
import { contentUriPath } from "@coremedia/ckeditor5-coremedia-studio-integration";
import { expect, test } from "./base";
import { editor } from "./locators/editor";
import { applicationUrl } from "./utils/environment";
import { ApplicationWrapper } from "./wrappers/ApplicationWrapper";

/**
 * Provides some first test mainly for demonstration purpose of the test API.
 */
test.describe("Hello Editor", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(applicationUrl);
    await editor(page).waitFor();
  });

  test("Should update data when cleared.", async ({ page }) => {
    const application = new ApplicationWrapper(page);
    const { editor: editorWrapper } = application;
    await editorWrapper.setData("");
    await expect.poll(() => editorWrapper.getData()).toBe("");
  });

  test("Should initially load with some welcome text rendered.", async ({ page }) => {
    // In editing view the welcome text is rendered into a `h1` heading.
    await editor(page).locator("h1", { hasText: "CoreMedia" }).waitFor();
  });

  test("Should render external links.", async ({ page }, testInfo) => {
    const name = testInfo.title;
    const application = new ApplicationWrapper(page);
    const { editor: editorWrapper } = application;
    const editable = editor(page);

    const linkTarget = "https://example.org";
    const data = richtext(p(a(name, { "xlink:href": linkTarget })));
    await editorWrapper.setData(data);

    // Match: We cannot fully match `<a href=...>`, as CKEditor may add classes
    // for display purpose to the UI. Nevertheless, this serves as example, how
    // we may test the rendered editing view.
    await expect.poll(() => editable.innerHTML()).toContain(` href="${linkTarget}">${name}</a>`);
  });

  test("Should render internal links.", async ({ page }, testInfo) => {
    const name = testInfo.title;
    const application = new ApplicationWrapper(page);
    const { editor: editorWrapper, mockContent } = application;
    const editable = editor(page);

    const id = 42;
    await mockContent.addContents({
      id,
      name: `Document for test ${name}`,
    });

    const dataLink = contentUriPath(id);
    const data = richtext(p(a(name, { "xlink:href": dataLink })));
    await editorWrapper.setData(data);

    // Match: We cannot fully match `<a href=...>`, as CKEditor may add classes
    // for display purpose to the UI. Nevertheless, this serves as example, how
    // we may test the rendered editing view.
    //
    // `#`: For internal links, there is no representation in view. The reference
    // only exists on model layer.
    await expect.poll(() => editable.innerHTML()).toContain(` href="#">${name}</a>`);
  });
});
