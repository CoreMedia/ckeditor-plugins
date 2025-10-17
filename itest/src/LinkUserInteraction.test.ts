import { a, p, richtext } from "@coremedia-internal/ckeditor5-coremedia-example-data";
import { contentUriPath } from "@coremedia/ckeditor5-coremedia-studio-integration";
import type { Page } from "playwright";
import { ApplicationWrapper } from "./aut/ApplicationWrapper";
import type { MockServiceAgentPluginWrapper } from "./aut/services/MockServiceAgentPluginWrapper";
import "./expect/Expectations";

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
describe("Link User Interaction", () => {
  let application: ApplicationWrapper;

  beforeAll(async () => {
    application = await ApplicationWrapper.start();
    await application.goto();
    await expect(application).waitForCKEditorToBeAvailable();
  });

  afterAll(async () => {
    await application?.shutdown();
  });

  beforeEach(() => {
    application.console.open();
  });

  afterEach(() => {
    expect(application.console).toHaveNoErrorsOrWarnings();
    application.console.close();
  });

  describe("External Link Actions", () => {
    it("Should open in new browser tab on (Ctrl | Meta) + click", async () => {
      const { currentTestName } = expect.getState();
      const name = currentTestName ?? "Lorem ipsum";
      const { editor } = application;
      const { ui } = editor;
      const { view } = ui;

      const externalLinkUrl = "https://www.coremedia.com/";
      const data = richtext(p(a(name, { "xlink:href": externalLinkUrl })));
      await editor.setData(data);

      const externalLink = view.locator.locator(`a`, { hasText: name });

      const modifiers = await clickModifiers();
      const newPagePromise: Promise<Page> = new Promise<Page>((resolve) => context.once("page", resolve));
      await externalLink.click({ modifiers });
      const newTab: Page = await newPagePromise;
      expect(newTab.url()).toBe(externalLinkUrl);
      await newTab.close();
    });

    it("Should open in new browser tab on Alt + Enter", async () => {
      const { currentTestName } = expect.getState();
      const name = currentTestName ?? "Lorem ipsum";
      const { editor } = application;
      const { ui } = editor;
      const { view } = ui;

      const externalLinkUrl = "https://www.coremedia.com/";
      const data = richtext(p(a(name, { "xlink:href": externalLinkUrl })));
      await editor.setData(data);

      const externalLink = view.locator.locator(`a`, { hasText: name });

      const newPagePromise: Promise<Page> = new Promise<Page>((resolve) => context.once("page", resolve));
      await externalLink.click();
      await page.keyboard.down("Alt");
      await page.keyboard.press("Enter");
      const newTab: Page = await newPagePromise;
      expect(newTab.url()).toBe(externalLinkUrl);
      await newTab.close();
    });

    it("Read-Only: Should open in new browser tab on click", async () => {
      const { currentTestName } = expect.getState();
      const name = currentTestName ?? "Lorem ipsum";
      const { editor } = application;
      const { ui } = editor;
      const { view } = ui;

      const data = richtext(p(a(name, { "xlink:href": externalLinkUrl })));
      await editor.setData(data);
      await application.switchReadOnly();
      const contentLink = view.locator.locator(`a`, { hasText: name });

      const newPagePromise: Promise<Page> = new Promise<Page>((resolve) => context.once("page", resolve));
      await contentLink.click();
      const newTab: Page = await newPagePromise;
      expect(newTab.url()).toBe(externalLinkUrl);
      await newTab.close();
    });

    it("Read-Only: Should open in new browser tab on (Ctrl | Meta) + click", async () => {
      const { currentTestName } = expect.getState();
      const name = currentTestName ?? "Lorem ipsum";
      const { editor } = application;
      const { ui } = editor;
      const { view } = ui;

      const data = richtext(p(a(name, { "xlink:href": externalLinkUrl })));
      await editor.setData(data);
      await application.switchReadOnly();
      const contentLink = view.locator.locator(`a`, { hasText: name });
      const modifiers = await clickModifiers();

      const newPagePromise: Promise<Page> = new Promise<Page>((resolve) => context.once("page", resolve));
      await contentLink.click({ modifiers });
      const newTab: Page = await newPagePromise;
      expect(newTab.url()).toBe(externalLinkUrl);
      await newTab.close();
    });
  });

  describe("Content Link Actions", () => {
    it("Should open in new work area tab on (Ctrl | Meta) + click", async () => {
      const { currentTestName } = expect.getState();
      const name = currentTestName ?? "Lorem ipsum";
      const { editor, mockContent } = application;
      const { ui } = editor;
      const { view } = ui;
      const id = 42;
      await mockContent.addContents({
        id,
        name: `Document for test ${name}`,
      });

      const dataLink = contentUriPath(id);
      const data = richtext(p(a(name, { "xlink:href": dataLink })));
      await editor.setData(data);

      const contentLink = view.locator.locator(`a`, { hasText: name });

      const modifiers = await clickModifiers();
      await contentLink.click({ modifiers });
      const serviceAgent: MockServiceAgentPluginWrapper = await application.mockServiceAgent;
      const mockContentFormService = await serviceAgent.getContentFormServiceWrapper();
      expect(await mockContentFormService.getLastOpenedEntities()).toEqual(["content/42"]);
    });
    it("Should open in new work area tab on Alt+Enter", async () => {
      const { currentTestName } = expect.getState();
      const name = currentTestName ?? "Lorem ipsum";
      const { editor, mockContent } = application;
      const { ui } = editor;
      const { view } = ui;
      const id = 42;
      await mockContent.addContents({
        id,
        name: `Document for test ${name}`,
      });

      const dataLink = contentUriPath(id);
      const data = richtext(p(a(name, { "xlink:href": dataLink })));
      await editor.setData(data);

      const contentLink = view.locator.locator(`a`, { hasText: name });

      await contentLink.click();
      await page.keyboard.down("Alt");
      await page.keyboard.press("Enter");

      const serviceAgent: MockServiceAgentPluginWrapper = await application.mockServiceAgent;
      const mockContentFormService = await serviceAgent.getContentFormServiceWrapper();
      expect(await mockContentFormService.getLastOpenedEntities()).toEqual(["content/42"]);
    });

    it("Read-Only: Should open in new work area tab on click", async () => {
      const { currentTestName } = expect.getState();
      const name = currentTestName ?? "Lorem ipsum";
      const { editor, mockContent } = application;
      const { ui } = editor;
      const { view } = ui;
      const id = 42;
      await mockContent.addContents({
        id,
        name: `Document for test ${name}`,
      });

      const dataLink = contentUriPath(id);
      const data = richtext(p(a(name, { "xlink:href": dataLink })));
      await editor.setData(data);
      await application.switchReadOnly();

      const contentLink = view.locator.locator(`a`, { hasText: name });
      await contentLink.click();
      const serviceAgent: MockServiceAgentPluginWrapper = await application.mockServiceAgent;
      const mockContentFormService = await serviceAgent.getContentFormServiceWrapper();
      expect(await mockContentFormService.getLastOpenedEntities()).toEqual(["content/42"]);
    });

    it("Read-Only: Should open in new work area tab on (Ctrl | Meta) + click", async () => {
      const { currentTestName } = expect.getState();
      const name = currentTestName ?? "Lorem ipsum";
      const { editor, mockContent } = application;
      const { ui } = editor;
      const { view } = ui;
      const id = 42;
      await mockContent.addContents({
        id,
        name: `Document for test ${name}`,
      });

      const dataLink = contentUriPath(id);
      const data = richtext(p(a(name, { "xlink:href": dataLink })));
      await editor.setData(data);
      await application.switchReadOnly();

      const contentLink = view.locator.locator(`a`, { hasText: name });
      const modifiers = await clickModifiers();
      await contentLink.click({ modifiers });
      const serviceAgent: MockServiceAgentPluginWrapper = await application.mockServiceAgent;
      const mockContentFormService = await serviceAgent.getContentFormServiceWrapper();
      expect(await mockContentFormService.getLastOpenedEntities()).toEqual(["content/42"]);
    });
  });
});

type ClickModifiers = "Meta" | "Control";

const clickModifiers = async (): Promise<ClickModifiers[]> => ((await isMac()) ? ["Meta"] : ["Control"]);

const isMac = async (): Promise<boolean> => {
  const response = String(await page.evaluate(() => navigator.userAgent));
  return response.includes("Mac");
};
