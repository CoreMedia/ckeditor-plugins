import "./expect/Expectations";
import { ApplicationWrapper } from "./aut/ApplicationWrapper";
import { contentUriPath } from "@coremedia/ckeditor5-coremedia-studio-integration/content/UriPath";
import { a, p, richtext } from "@coremedia-internal/ckeditor5-coremedia-example-data/RichTextBase";
import { Locator } from "playwright";
import { ctrlOrMeta } from "./browser/UserAgent";

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
      const contentLink = view.locator.locator(`a`, { hasText: name });

      await contentLink.click();

      const { linkActionsView } = editor.ui.view.body.balloonPanel;

      // The ballon should pop up on click.
      await expect(linkActionsView).waitToBeVisible();

      const { contentLinkView } = linkActionsView;

      await expect(contentLinkView).waitToBeVisible();
      await expect(contentLinkView.locator).toHaveText(`Document for`);
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

      const { linkActionsView } = view.body.balloonPanel;
      await expect(linkActionsView).waitToBeVisible();
      await page.keyboard.press("Tab");
      await expectFocusedElementHasAriaText(contentName);
      await page.keyboard.press("Tab");
      await expectFocusedElementHasAriaText("Edit link");
      await page.keyboard.press("Tab");
      await expectFocusedElementHasAriaText("Open in Current Tab");
      await page.keyboard.press("Tab");
      await expectFocusedElementHasAriaText("Open in New Tab");
      await page.keyboard.press("Tab");
      await expectFocusedElementHasAriaText("Show Embedded");
      await page.keyboard.press("Tab");
      await expectFocusedElementHasAriaText("Open in Frame");
      await page.keyboard.press("Tab");
      await expectFocusedElementHasAriaText("Unlink");
    });
  });

  describe("FormView Extension", () => {
    it("Should be possible to delete content link", async () => {
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

      const { linkActionsView, linkFormView } = view.body.balloonPanel;

      await expect(linkActionsView).waitToBeVisible();
      await linkActionsView.edit();

      await expect(linkFormView).waitToBeVisible();

      const { contentLinkView } = linkFormView;

      await expect(contentLinkView).waitToBeVisible();
      await expect(contentLinkView.locator).toHaveText(`Document for`);

      await contentLinkView.remove();

      // Content Link View should have been removed.
      await expect(contentLinkView).not.waitToBeVisible();

      await linkFormView.save();

      // The link should have been cleared also in data.
      // Note, that it is expected behavior, that the anchor element itself
      // remains. To completely remove it, you have to use the unlink-button.
      await expect(editor).waitForDataContaining(`xlink:href=""`);
    });

    it("Should be possible to delete content link with keyboard", async () => {
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
      const contentLink = view.locator.locator(`a`, { hasText: name });

      await contentLink.click({
        position: {
          x: 1,
          y: 1,
        },
      });

      const { linkActionsView, linkFormView } = view.body.balloonPanel;

      await expect(linkActionsView).waitToBeVisible();
      await tabToAriaLabel("Edit Link");
      await page.keyboard.press("Enter");

      const { contentLinkView } = linkFormView;

      await expect(contentLinkView).waitToBeVisible();
      await expect(contentLinkView.locator).toHaveText(`Document for`);

      await page.keyboard.press("Tab");
      await page.keyboard.press("Space");

      await expect(linkFormView).waitToBeVisible();

      await linkFormView.save();

      // The link should have been cleared also in data.
      // Note, that it is expected behavior, that the anchor element itself
      // remains. To completely remove it, you have to use the unlink-button.
      await expect(editor).waitForDataContaining(`xlink:href=""`);
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
    await expect(linkFormView).waitToBeVisible();
    await page.keyboard.type(`content:${id}`);

    await page.keyboard.press("Tab");
    await page.keyboard.press("Enter");

    const contentLink = view.locator.locator(`a`, { hasText: `content:${id}` });
    await expect(contentLink).toBeDefined();
  });
});

const expectFocusedElementHasAriaText = async function (ariaLabelContent: string): Promise<void> {
  const focusedElement: Locator = await page.locator("*:focus");
  await expect(focusedElement).waitToHaveAriaLabel(ariaLabelContent);
};

const tabToAriaLabel = async function (ariaLabelContent: string): Promise<void> {
  const firstItem = await page.locator("*:focus");
  if (await hasAriaLabel(firstItem, ariaLabelContent)) {
    return;
  }
  const firstItemAriaLabelContent = await getAriaLabel(firstItem);
  if (!firstItemAriaLabelContent) {
    return Promise.reject();
  }

  await page.keyboard.press("Tab");
  while (!(await focusedElementHasAriaText(firstItemAriaLabelContent))) {
    if (await focusedElementHasAriaText(ariaLabelContent)) {
      break;
    }
    await page.keyboard.press("Tab");
  }
};

const focusedElementHasAriaText = async (ariaText: string): Promise<boolean> => {
  const focusedElement = await page.locator("*:focus");
  return hasAriaLabel(focusedElement, ariaText);
};

const hasAriaLabel = async (element: Locator, ariaLabel: string): Promise<boolean> => {
  const ariaLabelContent = await getAriaLabel(element);
  return ariaLabelContent === ariaLabel;
};

const getAriaLabel = async (element: Locator): Promise<string | null> => {
  const ariaLabelId = await element.getAttribute("aria-labelledby");
  if (!ariaLabelId) {
    return Promise.reject(`No aria label found for locator: ${await element.innerHTML()}`);
  }
  const ariaLabelSpan = element.locator(`span#${ariaLabelId}`);
  return ariaLabelSpan.textContent();
};
