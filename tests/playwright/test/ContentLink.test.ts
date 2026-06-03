import { contentUriPath } from "@coremedia/ckeditor5-coremedia-studio-integration";
import { a, p, richtext } from "@coremedia-internal/ckeditor5-coremedia-example-data";
import { expect, test } from "./base";
import { editor } from "./locators/editor";
import { applicationUrl } from "./utils/environment";
import { ApplicationWrapper } from "./wrappers/ApplicationWrapper";

test.describe("Content Link Feature", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(applicationUrl);
    await editor(page).waitFor();
  });

  test.describe("ActionsView Extension", () => {
    test("Should render content-link with name", async ({ page }, testInfo) => {
      const name = testInfo.title;
      const application = new ApplicationWrapper(page);
      const { editor: editorWrapper, mockContent } = application;
      const { view } = editorWrapper.ui;
      const id = 42;
      await mockContent.addContents({
        id,
        name: `Document for test ${name}`,
      });

      const dataLink = contentUriPath(id);
      const data = richtext(p(a(name, { "xlink:href": dataLink })));
      await editorWrapper.setData(data);

      // In editing view links are represented with href="#".
      const contentLink = view.locator.getByText(name);
      await contentLink.waitFor();
      await contentLink.click();

      const { linkToolbarView } = view.body.balloonPanel;

      // The balloon should pop up on click.
      await linkToolbarView.locator.waitFor();

      const { contentLinkView } = linkToolbarView;
      await contentLinkView.locator.waitFor();
      await expect(contentLinkView.locator.getByText("Document for")).toBeVisible();
    });

    test("Should be possible to reach all buttons with keyboard", async ({ page }, testInfo) => {
      const name = testInfo.title;
      const application = new ApplicationWrapper(page);
      const { editor: editorWrapper, mockContent } = application;
      const { view } = editorWrapper.ui;

      const id = 48;
      const contentName = `Document for test ${name}`;
      await mockContent.addContents({
        id,
        name: contentName,
      });

      const dataLink = contentUriPath(id);
      const data = richtext(p(a(name, { "xlink:href": dataLink })));
      await editorWrapper.setData(data);

      // In editing view links are represented with href="#".
      const contentLink = view.locator.locator("a", { hasText: name });
      await contentLink.click({ position: { x: 1, y: 1 } });

      const { linkToolbarView } = view.body.balloonPanel;
      await linkToolbarView.locator.waitFor();
      await page.keyboard.press("Tab");
      await expect(page.locator("*:focus")).toHaveAccessibleName(`Document: ${contentName}`);
      await page.keyboard.press("ArrowRight");
      await expect(page.locator("*:focus")).toHaveAccessibleName("Edit link");
      await page.keyboard.press("ArrowRight");
      await expect(page.locator("*:focus")).toHaveAccessibleName("Open in Current Tab");
      await page.keyboard.press("ArrowRight");
      await expect(page.locator("*:focus")).toHaveAccessibleName("Open in New Tab");
      await page.keyboard.press("ArrowRight");
      await expect(page.locator("*:focus")).toHaveAccessibleName("Show Embedded");
      await page.keyboard.press("ArrowRight");
      await expect(page.locator("*:focus")).toHaveAccessibleName("Open in Frame");
      await page.keyboard.press("ArrowRight");
      await expect(page.locator("*:focus")).toHaveAccessibleName("Unlink");
    });
  });

  test.describe("FormView Extension", () => {
    test("Should be not possible to save content link with empty url", async ({ page }, testInfo) => {
      const name = testInfo.title;
      const application = new ApplicationWrapper(page);
      const { editor: editorWrapper, mockContent } = application;
      const { view } = editorWrapper.ui;

      const id = 44;
      await mockContent.addContents({
        id,
        name: `Document for test ${name}`,
      });

      const dataLink = contentUriPath(id);
      const data = richtext(p(a(name, { "xlink:href": dataLink })));
      await editorWrapper.setData(data);

      // In editing view links are represented with href="#".
      const contentLink = view.locator.locator("a", { hasText: name });
      await contentLink.click({ position: { x: 1, y: 1 } });

      const { linkToolbarView, linkFormView } = view.body.balloonPanel;

      await linkToolbarView.locator.waitFor();
      await linkToolbarView.edit();

      await linkFormView.locator.waitFor();
      const { contentLinkView } = linkFormView;

      await expect(contentLinkView.locator).toBeVisible();
      await contentLinkView.locator.getByText("Document for").waitFor();

      await contentLinkView.remove();

      // Content Link View should have been removed.
      await expect(contentLinkView.locator).toBeHidden();

      await expect(linkFormView.saveButtonLocator).toBeDisabled();
    });

    test("Should not be possible to save content link with empty url using keyboard", async ({ page }, testInfo) => {
      const name = testInfo.title;
      const application = new ApplicationWrapper(page);
      const { editor: editorWrapper, mockContent } = application;
      const { view } = editorWrapper.ui;

      const id = 50;
      await mockContent.addContents({
        id,
        name: `Document for test ${name}`,
      });

      const dataLink = contentUriPath(id);
      const data = richtext(p(a(name, { "xlink:href": dataLink })));
      await editorWrapper.setData(data);

      // In editing view links are represented with href="#".
      const contentLink = view.locator.getByText(name);
      await contentLink.click({ position: { x: 1, y: 1 } });

      const { linkToolbarView, linkFormView } = view.body.balloonPanel;
      await linkToolbarView.locator.waitFor();
      await linkToolbarView.locator.getByLabel("Edit link").waitFor();

      await page.keyboard.press("Tab");
      await page.keyboard.press("ArrowRight");
      await page.keyboard.press("Enter");

      const { contentLinkView } = linkFormView;
      await contentLinkView.locator.getByText("Document for").waitFor();

      await page.keyboard.press("Tab");
      await page.keyboard.press("Space");

      await expect(linkFormView.saveButtonLocator).toBeDisabled();
    });
  });

  test("Should be possible to add content link with keyboard only", async ({ page }, testInfo) => {
    const name = testInfo.title;
    const application = new ApplicationWrapper(page);
    const { editor: editorWrapper, mockContent } = application;
    const id = 46;
    await mockContent.addContents({
      id,
      name: `Document for test ${name}`,
    });
    const { view } = editorWrapper.ui;
    await view.locator.click();
    // `ControlOrMeta` resolves to Meta on macOS and Control elsewhere.
    await page.keyboard.press("ControlOrMeta+k");
    const { linkFormView } = view.body.balloonPanel;
    await linkFormView.locator.waitFor();
    await page.keyboard.type(`content:${id}`);

    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Enter");

    const contentLink = view.locator.locator("a");
    await expect(contentLink).toHaveText(`content:${id}`);
  });

  test("Should be possible to select content from suggestions.", async ({ page }) => {
    const application = new ApplicationWrapper(page);
    const { view } = application.editor.ui;

    await view.locator.click();

    // `ControlOrMeta` resolves to Meta on macOS and Control elsewhere.
    await page.keyboard.press("ControlOrMeta+a");
    await page.keyboard.press("Delete");

    await page.keyboard.press("ControlOrMeta+k");

    const { linkFormView } = view.body.balloonPanel;
    await linkFormView.locator.waitFor();

    await linkFormView.locator.locator(".ck-dropdown").waitFor();
    await linkFormView.locator.locator(".ck-dropdown").locator("input.ck-input-text").waitFor();
    await linkFormView.locator.getByLabel("Document: Some Document").waitFor();

    await page.keyboard.type("101");

    await linkFormView.locator.getByLabel("Document: Document #1010").waitFor();
    await linkFormView.locator.getByLabel("Folder: Folder #1011").waitFor();

    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");

    await page.waitForTimeout(2000);

    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Enter");

    await page.getByRole("link", { name: "Some Folder" }).waitFor();
  });
});
