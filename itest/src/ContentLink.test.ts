import "./expect/Expectations";
import { ApplicationWrapper } from "./aut/ApplicationWrapper";
import { contentUriPath } from "@coremedia/ckeditor5-coremedia-studio-integration";
import { a, p, richtext } from "@coremedia-internal/ckeditor5-coremedia-example-data";
import { ctrlOrMeta } from "./browser/UserAgent";
import { expectFocusedElementHasAriaText } from "./aria/AriaUtils";
import waitForExpect from "wait-for-expect";

describe("Content Link Feature", () => {
  // noinspection DuplicatedCode
  let application: ApplicationWrapper;

  const reload = async () => {
    await application.goto();
    // Wait for CKEditor to be available prior to executing/continuing the tests.
    await expect(application).waitForCKEditorToBeAvailable();
  };

  beforeAll(async () => {
    application = await ApplicationWrapper.start();
  });

  afterAll(async () => {
    await application?.shutdown();
  });

  beforeEach(async () => {
    // Unable to get the balloon in subsequent tests, once the first test
    // ran. Reload helps. There may be better options, but it helps for now.
    await reload();
    application.console.open();
  });

  afterEach(() => {
    expect(application.console).toHaveNoErrorsOrWarnings();
    application.console.close();
  });

  describe("ActionsView Extension", () => {
    it("Should render content-link with name", async () => {
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

      // In editing view links are represented with href="#".
      const contentLink = view.locator.getByText(name);
      await contentLink.waitFor();
      await contentLink.click();

      const { linkToolbarView } = editor.ui.view.body.balloonPanel;

      // The ballon should pop up on click.
      await linkToolbarView.locator.waitFor();

      const { contentLinkView } = linkToolbarView;

      await contentLinkView.locator.waitFor();
      await waitForExpect(() => expect(contentLinkView.locator.getByText("Document for")).toBeDefined());
    });

    it("Should be possible to reach all buttons with keyboard", async () => {
      const { currentTestName } = expect.getState();
      const name = currentTestName ?? "Lorem ipsum";
      const { editor, mockContent } = application;
      const { ui } = editor;
      const { view } = ui;

      const id = 48;
      const contentName = `Document for test ${name}`;
      await mockContent.addContents({
        id,
        name: contentName,
      });

      const dataLink = contentUriPath(id);
      const data = richtext(p(a(name, { "xlink:href": dataLink })));
      await editor.setData(data);

      // In editing view links are represented with href="#".
      const contentLink = view.locator.locator(`a`, { hasText: name });

      await contentLink.click({
        position: {
          x: 1,
          y: 1,
        },
      });

      const { linkToolbarView } = view.body.balloonPanel;
      await linkToolbarView.locator.waitFor();
      await page.keyboard.press("Tab");
      await expectFocusedElementHasAriaText(`Document: ${contentName}`);
      await page.keyboard.press("ArrowRight");
      await expectFocusedElementHasAriaText("Edit link");
      await page.keyboard.press("ArrowRight");
      await expectFocusedElementHasAriaText("Open in Current Tab");
      await page.keyboard.press("ArrowRight");
      await expectFocusedElementHasAriaText("Open in New Tab");
      await page.keyboard.press("ArrowRight");
      await expectFocusedElementHasAriaText("Show Embedded");
      await page.keyboard.press("ArrowRight");
      await expectFocusedElementHasAriaText("Open in Frame");
      await page.keyboard.press("ArrowRight");
      await expectFocusedElementHasAriaText("Unlink");
    });
  });

  describe("FormView Extension", () => {
    it("Should be not possible to save content link with empty url", async () => {
      const { currentTestName } = expect.getState();
      const name = currentTestName ?? "Lorem ipsum";
      const { editor, mockContent } = application;
      const { ui } = editor;
      const { view } = ui;

      const id = 44;
      await mockContent.addContents({
        id,
        name: `Document for test ${name}`,
      });

      const dataLink = contentUriPath(id);
      const data = richtext(p(a(name, { "xlink:href": dataLink })));
      await editor.setData(data);

      // In editing view links are represented with href="#".
      const contentLink = view.locator.locator(`a`, { hasText: name });

      await contentLink.click({
        position: {
          x: 1,
          y: 1,
        },
      });

      const { linkToolbarView, linkFormView } = view.body.balloonPanel;

      await linkToolbarView.locator.waitFor();
      await linkToolbarView.edit();

      await linkFormView.locator.waitFor();
      const { contentLinkView } = linkFormView;

      await waitForExpect(() => expect(contentLinkView).waitToBeVisible());
      await contentLinkView.locator.getByText(`Document for`).waitFor();

      await contentLinkView.remove();

      // Content Link View should have been removed.
      await waitForExpect(() => expect(contentLinkView).not.waitToBeVisible());

      await waitForExpect(() => expect(linkFormView.saveButtonLocator).toBeDisabled());
    });

    it("Should not be possible to save content link with empty url using keyboard", async () => {
      const { currentTestName } = expect.getState();
      const name = currentTestName ?? "Lorem ipsum";
      const { editor, mockContent } = application;
      const { ui } = editor;
      const { view } = ui;

      const id = 50;
      await mockContent.addContents({
        id,
        name: `Document for test ${name}`,
      });

      const dataLink = contentUriPath(id);
      const data = richtext(p(a(name, { "xlink:href": dataLink })));
      await editor.setData(data);
      // In editing view links are represented with href="#".
      const contentLink = view.locator.getByText(name);

      await contentLink.click({
        position: {
          x: 1,
          y: 1,
        },
      });

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

      await waitForExpect(() => expect(linkFormView.saveButtonLocator).toBeDisabled());
    });
  });

  it("Should be possible to add content link with keyboard only", async () => {
    const { currentTestName } = expect.getState();
    const name = currentTestName ?? "Lorem ipsum";
    const { editor, mockContent } = application;
    const id = 46;
    await mockContent.addContents({
      id,
      name: `Document for test ${name}`,
    });
    const { ui } = editor;
    const { view } = ui;
    await view.locator.click();
    const modifier: string = await ctrlOrMeta();
    await page.keyboard.press(`${modifier}+k`);
    const { linkFormView } = editor.ui.view.body.balloonPanel;
    await linkFormView.locator.waitFor();
    await page.keyboard.type(`content:${id}`);

    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Enter");

    const contentLink = view.locator.locator(`a`);

    await expect(contentLink).toHaveText(`content:${id}`);
  });

  it("Should be possible to select content from suggestions.", async () => {
    const { editor } = application;
    const { ui } = editor;
    const { view } = ui;

    await view.locator.click();
    const modifier: string = await ctrlOrMeta();
    await page.keyboard.press(`${modifier}+k`);

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

    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Enter");

    const contentLink = view.locator.locator(`a`);
    await expect(contentLink).toHaveText("content:101");
  });
});
