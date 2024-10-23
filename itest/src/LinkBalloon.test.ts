import "./expect/Expectations";
import { ApplicationWrapper } from "./aut/ApplicationWrapper";
import { contentUriPath } from "@coremedia/ckeditor5-coremedia-studio-integration";
import { a, p, richtext } from "@coremedia-internal/ckeditor5-coremedia-example-data";

describe("Link Balloon", () => {
  let application: ApplicationWrapper;
  let draggableDivId: string;
  let configuredClickKeepOpenDivId: string;
  let configuredClickKeepOpenDivClass: string;

  beforeAll(async () => {
    application = await ApplicationWrapper.start();
    await application.goto();
    // Wait for CKEditor to be available prior to executing/continuing the tests.
    await expect(application).waitForCKEditorToBeAvailable();
    draggableDivId = await injectDraggable();
    configuredClickKeepOpenDivId = await injectKeepOpenWithIdDiv();
    configuredClickKeepOpenDivClass = await injectKeepOpenWithClassDiv();
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

  describe("Close behavior on click on other elements", () => {
    it("Should stay open when click on configured element id or element class", async () => {
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
      // Open the balloon
      const contentLink = view.locator.locator(`a`, { hasText: name });
      await contentLink.click();

      const { linkActionsView } = editor.ui.view.body.balloonPanel;
      // The ballon should pop up on click.
      await expect(linkActionsView).waitToBeVisible();

      await page.locator(`#${configuredClickKeepOpenDivId}`).click();
      await expect(linkActionsView).waitToBeVisible();

      await page.locator(`.${configuredClickKeepOpenDivClass}`).click();
      await expect(linkActionsView).waitToBeVisible();
    });

    it("Should close when click on draggable element", async () => {
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
      // Open the balloon
      const contentLink = view.locator.locator(`a`, { hasText: name });
      await contentLink.click();

      const { linkActionsView } = editor.ui.view.body.balloonPanel;
      // The ballon should pop up on click.
      await expect(linkActionsView).waitToBeVisible();

      await page.locator(`#${draggableDivId}`).click();
      await expect(linkActionsView).not.waitToBeVisible();
    });

    it("Should stay open when mousedown on draggable element", async () => {
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
      // Open the balloon
      const contentLink = view.locator.locator(`a`, { hasText: name });
      await contentLink.click();

      const { linkActionsView } = editor.ui.view.body.balloonPanel;
      // The ballon should pop up on click.
      await expect(linkActionsView).waitToBeVisible();

      await page.locator(`#${draggableDivId}`).hover();
      await page.mouse.down();
      await expect(linkActionsView).waitToBeVisible();
    });
  });
});

const injectDraggable = async (): Promise<string> => {
  const draggableId = "draggable-element-for-link-balloon-test";
  await page.evaluate((draggableId) => {
    const draggableDiv = document.createElement("div");
    draggableDiv.draggable = true;
    draggableDiv.id = draggableId;
    draggableDiv.style.width = "50px";
    draggableDiv.style.height = "50px";
    draggableDiv.style.backgroundColor = "#00FF00";
    document.body.appendChild(draggableDiv);
  }, draggableId);
  return Promise.resolve(draggableId);
};

/**
 * Creates a div element with an id configured in CKEditor to not close the link balloon
 * on click.
 */
const injectKeepOpenWithIdDiv = async (): Promise<string> => {
  const id = "example-to-keep-the-link-balloon-open-on-click";
  await page.evaluate((id) => {
    const htmlDivElement = document.createElement("div");
    htmlDivElement.id = id;
    htmlDivElement.style.width = "50px";
    htmlDivElement.style.height = "50px";
    htmlDivElement.style.backgroundColor = "#FF0000";
    document.body.appendChild(htmlDivElement);
  }, id);
  return Promise.resolve(id);
};

/**
 * Creates a div element with a class configured in CKEditor to not close the link balloon
 * on click.
 */
const injectKeepOpenWithClassDiv = async (): Promise<string> => {
  const aClass = "example-class-to-keep-the-link-balloon-open-on-click";
  await page.evaluate((aClass) => {
    const htmlDivElementWithClass = document.createElement("div");
    htmlDivElementWithClass.id = "unknownId";
    htmlDivElementWithClass.classList.add(aClass);
    htmlDivElementWithClass.style.width = "50px";
    htmlDivElementWithClass.style.height = "50px";
    htmlDivElementWithClass.style.backgroundColor = "#00FF00";
    document.body.appendChild(htmlDivElementWithClass);
  }, aClass);
  return Promise.resolve(aClass);
};
