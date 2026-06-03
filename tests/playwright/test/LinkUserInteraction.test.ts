import { a, p, richtext } from "@coremedia-internal/ckeditor5-coremedia-example-data";
import { contentUriPath } from "@coremedia/ckeditor5-coremedia-studio-integration";
import { expect, test } from "./base";
import { editor } from "./locators/editor";
import { applicationUrl } from "./utils/environment";
import { ApplicationWrapper } from "./wrappers/ApplicationWrapper";

const externalLinkUrl = "https://www.coremedia.com/";

/**
 * Tests mouse and keyboard interaction with links in ckeditor.
 *
 * There are two different cases: Read only and read write.
 * In read only ckeditor must open links on click in a new browser tab
 * or in case it is a content link in a new work area tab.
 *
 * In read write a normal click opens the link balloon but Ctrl (or Meta for Mac)
 * opens the link in a new tab. For content's it has to be a new work area tab, otherwise
 * the same page would be opened in a new browser tab (as the anchor href is #).
 * Furthermore, in read write the same behavior is implemented as keyboard shortcut alt+enter.
 */
test.describe("Link User Interaction", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(applicationUrl);
    await editor(page).waitFor();
  });

  test.describe("External Link Actions", () => {
    test("Should open in new browser tab on (Ctrl | Meta) + click", async ({ page }, testInfo) => {
      const name = testInfo.title;
      const application = new ApplicationWrapper(page);
      const { editor: editorWrapper } = application;
      const { view } = editorWrapper.ui;

      const data = richtext(p(a(name, { "xlink:href": externalLinkUrl })));
      await editorWrapper.setData(data);

      const externalLink = view.locator.locator(`a`, { hasText: name });

      const newTabPromise = page.context().waitForEvent("page");
      // `ControlOrMeta` resolves to Meta on macOS and Control elsewhere.
      await externalLink.click({ modifiers: ["ControlOrMeta"] });
      const newTab = await newTabPromise;
      expect(newTab.url()).toBe(externalLinkUrl);
      await newTab.close();
    });

    test("Should open in new browser tab on Alt + Enter", async ({ page }, testInfo) => {
      const name = testInfo.title;
      const application = new ApplicationWrapper(page);
      const { editor: editorWrapper } = application;
      const { view } = editorWrapper.ui;

      const data = richtext(p(a(name, { "xlink:href": externalLinkUrl })));
      await editorWrapper.setData(data);

      const externalLink = view.locator.locator(`a`, { hasText: name });

      const newTabPromise = page.context().waitForEvent("page");
      await externalLink.click();
      await page.keyboard.down("Alt");
      await page.keyboard.press("Enter");
      const newTab = await newTabPromise;
      expect(newTab.url()).toBe(externalLinkUrl);
      await newTab.close();
    });

    test("Read-Only: Should open in new browser tab on click", async ({ page }, testInfo) => {
      const name = testInfo.title;
      const application = new ApplicationWrapper(page);
      const { editor: editorWrapper } = application;
      const { view } = editorWrapper.ui;

      const data = richtext(p(a(name, { "xlink:href": externalLinkUrl })));
      await editorWrapper.setData(data);
      await application.switchReadOnly();
      const contentLink = view.locator.locator(`a`, { hasText: name });

      const newTabPromise = page.context().waitForEvent("page");
      await contentLink.click();
      const newTab = await newTabPromise;
      expect(newTab.url()).toBe(externalLinkUrl);
      await newTab.close();
    });

    test("Read-Only: Should open in new browser tab on (Ctrl | Meta) + click", async ({ page }, testInfo) => {
      const name = testInfo.title;
      const application = new ApplicationWrapper(page);
      const { editor: editorWrapper } = application;
      const { view } = editorWrapper.ui;

      const data = richtext(p(a(name, { "xlink:href": externalLinkUrl })));
      await editorWrapper.setData(data);
      await application.switchReadOnly();
      const contentLink = view.locator.locator(`a`, { hasText: name });

      const newTabPromise = page.context().waitForEvent("page");
      // `ControlOrMeta` resolves to Meta on macOS and Control elsewhere.
      await contentLink.click({ modifiers: ["ControlOrMeta"] });
      const newTab = await newTabPromise;
      expect(newTab.url()).toBe(externalLinkUrl);
      await newTab.close();
    });
  });

  test.describe("Content Link Actions", () => {
    test("Should open in new work area tab on (Ctrl | Meta) + click", async ({ page }, testInfo) => {
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

      const contentLink = view.locator.locator(`a`, { hasText: name });

      // `ControlOrMeta` resolves to Meta on macOS and Control elsewhere.
      await contentLink.click({ modifiers: ["ControlOrMeta"] });
      const serviceAgent = application.mockServiceAgent;
      const mockContentFormService = serviceAgent.getContentFormServiceWrapper();
      expect(await mockContentFormService.getLastOpenedEntities()).toEqual(["content/42"]);
    });

    test("Should open in new work area tab on Alt+Enter", async ({ page }, testInfo) => {
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

      const contentLink = view.locator.locator(`a`, { hasText: name });

      await contentLink.click();
      await page.keyboard.down("Alt");
      await page.keyboard.press("Enter");

      const serviceAgent = application.mockServiceAgent;
      const mockContentFormService = serviceAgent.getContentFormServiceWrapper();
      expect(await mockContentFormService.getLastOpenedEntities()).toEqual(["content/42"]);
    });

    test("Read-Only: Should open in new work area tab on click", async ({ page }, testInfo) => {
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
      await application.switchReadOnly();

      const contentLink = view.locator.locator(`a`, { hasText: name });
      await contentLink.click();
      const serviceAgent = application.mockServiceAgent;
      const mockContentFormService = serviceAgent.getContentFormServiceWrapper();
      expect(await mockContentFormService.getLastOpenedEntities()).toEqual(["content/42"]);
    });

    test("Read-Only: Should open in new work area tab on (Ctrl | Meta) + click", async ({ page }, testInfo) => {
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
      await application.switchReadOnly();

      const contentLink = view.locator.locator(`a`, { hasText: name });
      // `ControlOrMeta` resolves to Meta on macOS and Control elsewhere.
      await contentLink.click({ modifiers: ["ControlOrMeta"] });
      const serviceAgent = application.mockServiceAgent;
      const mockContentFormService = serviceAgent.getContentFormServiceWrapper();
      expect(await mockContentFormService.getLastOpenedEntities()).toEqual(["content/42"]);
    });
  });
});
