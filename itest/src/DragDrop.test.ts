import { ApplicationWrapper } from "./aut/ApplicationWrapper";
import { richtext } from "@coremedia-internal/ckeditor5-coremedia-example-data/RichText";
import "./expect/Expectations";
import { DroppableElement } from "@coremedia/ckeditor5-coremedia-studio-integration-mock/content/MockDragDropPlugin";
import waitForExpect from "wait-for-expect";
import { MockContentConfig } from "@coremedia/ckeditor5-coremedia-studio-integration-mock/content/MockContent";
import { PNG_RED_240x135 } from "@coremedia/ckeditor5-coremedia-studio-integration-mock/content/MockFixtures";

describe("Drag and Drop", () => {
  // noinspection DuplicatedCode
  let application: ApplicationWrapper;

  beforeAll(async () => {
    application = await ApplicationWrapper.start();
    await application.goto();
    // Wait for CKEditor to be available prior to executing/continuing the tests.
    await expect(application).waitForCKEditorToBeAvailable();
  });

  afterAll(async () => {
    await application?.shutdown();
  });

  beforeEach(async () => {
    application.console.open();

    //setup initial data
    const initialData = richtext();
    const { editor } = application;
    await editor.setDataAndGetDataView(initialData);
  });

  afterEach(() => {
    expect(application.console).toHaveNoErrorsOrWarnings();
    application.console.close();
  });

  describe("Links", () => {
    it("Should drag a content to the editor, the content is rendered as link", async () => {
      const contentId = 10000;
      const droppableElement: DroppableElement = {
        label: "Drag And Drop Test",
        tooltip: "test-element",
        items: [contentId],
        classes: ["drag-content"],
      };
      const contentMock = {
        id: contentId,
        name: `${droppableElement.label}: ${contentId}`,
      };
      //Add contents and create the draggable element
      await application.mockContent.addContents(contentMock);
      await application.mockDragDrop.addDraggableElement(droppableElement);

      //execute drag and drop
      const dragElementSelector = ".drag-example.drag-content";
      const dropTargetSelector = ".ck-content.ck-editor__editable";
      await dragAndDrop(droppableElement, dragElementSelector, dropTargetSelector);

      // Validate Editing Downcast
      const { ui } = application.editor;
      const editableHandle = await ui.getEditableElement();
      const linkElement = await editableHandle.$("a");
      await waitForExpect(() => expect(linkElement).toHaveText(contentMock.name));
    });

    it("Should drag three contents to the editor, the contents are rendered in the correct order as links", async () => {
      const firstContentId = 10000;
      const secondContentId = 10002;
      const thirdContentId = 10004;
      const droppableElement: DroppableElement = {
        label: "Drag And Drop Test",
        tooltip: "test-element",
        items: [firstContentId, secondContentId, thirdContentId],
        classes: ["drag-content"],
      };
      const contentMocks = [
        {
          id: firstContentId,
          name: `${droppableElement.label}: ${firstContentId}`,
        },
        {
          id: secondContentId,
          name: `${droppableElement.label}: ${secondContentId}`,
        },
        {
          id: thirdContentId,
          name: `${droppableElement.label}: ${thirdContentId}`,
        },
      ];
      await application.mockContent.addContents(contentMocks[0]);
      await application.mockContent.addContents(contentMocks[1]);
      await application.mockContent.addContents(contentMocks[2]);
      await application.mockDragDrop.addDraggableElement(droppableElement);

      //execute drag and drop
      const dragElementSelector = ".drag-example.drag-content";
      const dropTargetSelector = ".ck-content.ck-editor__editable";
      await dragAndDrop(droppableElement, dragElementSelector, dropTargetSelector);

      // Validate Editing Downcast
      const { ui } = application.editor;
      const editableHandle = await ui.getEditableElement();
      const linkElements = await editableHandle.$$("a");
      await waitForExpect(() => {
        expect(linkElements).toHaveLength(3);

        expect(linkElements[0]).toHaveText(contentMocks[0].name);
        expect(linkElements[1]).toHaveText(contentMocks[1].name);
        expect(linkElements[2]).toHaveText(contentMocks[2].name);
      });
    });
  });

  describe("Images", () => {
    it("Should drag an image-content to the editor, the content is rendered as an image", async () => {
      const contentId = 10002;
      const droppableElement: DroppableElement = {
        label: "Drag And Drop Test",
        tooltip: "test-element",
        items: [contentId],
        classes: ["drag-content"],
      };
      const contentName = `${droppableElement.label}: ${contentId}`;
      const contentMock: MockContentConfig = {
        id: contentId,
        name: contentName,
        blob: PNG_RED_240x135,
        embeddable: true,
        linkable: true,
      };
      //Add contents and create the draggable element
      await application.mockContent.addContents(contentMock);
      await application.mockDragDrop.addDraggableElement(droppableElement);

      //execute drag and drop
      const dragElementSelector = ".drag-example.drag-content";
      const dropTargetSelector = ".ck-content.ck-editor__editable";
      await dragAndDrop(droppableElement, dragElementSelector, dropTargetSelector);

      // Validate Editing Downcast
      const { ui } = application.editor;

      await waitForExpect(async () => {
        const data = await application.editor.getData();
        // noinspection HtmlUnknownAttribute
        expect(data).toContain(`<img alt=\"\" xlink:href=\"content/${contentId}#properties.data\"/>`);
      });

      const editableHandle = await ui.getEditableElement();
      const image = await editableHandle.$("img");
      await waitForExpect(() => {
        expect(image).toMatchAttribute("src", PNG_RED_240x135);
        expect(image).toMatchAttribute("title", contentName);
      });
    });
  });

  async function dragAndDrop(
    droppableElement: DroppableElement,
    dragElementSelector: string,
    dropTargetSelector: string
  ): Promise<void> {
    await page.waitForSelector(dragElementSelector);
    await page.waitForSelector(dropTargetSelector);
    const dragElement = page.locator(dragElementSelector);
    const dropTarget = page.locator(dropTargetSelector);

    await ensureDropAllowed(droppableElement);
    await dragElement.dragTo(dropTarget);
  }

  /**
   * Ensures that the drop is allowed into the CKEditor.
   *
   * This contains some implementation knowledge. The "dragover" calculates if the drop is allowed or not.
   * While the "dragover" is a synchronous event the data retrieval for the calculation is asynchronous.
   * "dragover" will be executed many times while hovering over the CKEditor and on entering the CKEditor the asynchronous
   * fetch is triggered. The result will be written to a cache. The next "dragover" will be calculated using those data.
   *
   * @param droppableElement -
   */
  async function ensureDropAllowed(droppableElement: DroppableElement): Promise<void> {
    await waitForExpect(async () => {
      const actual = await application.mockDragDrop.prefillCaches(droppableElement.items);
      expect(actual).toBeTruthy();
    });
  }
});
