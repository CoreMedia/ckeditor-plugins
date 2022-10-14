import { ApplicationWrapper } from "./aut/ApplicationWrapper";
import { richtext } from "@coremedia-internal/ckeditor5-coremedia-example-data/RichText";
import "./expect/Expectations";
import { DroppableElement } from "@coremedia/ckeditor5-coremedia-studio-integration-mock/content/MockDragDropPlugin";
import waitForExpect from "wait-for-expect";
import { MockContentConfig } from "@coremedia/ckeditor5-coremedia-studio-integration-mock/content/MockContent";
import { PNG_RED_240x135 } from "@coremedia/ckeditor5-coremedia-studio-integration-mock/content/MockFixtures";

const oneLink = [
  {
    id: 10000,
    name: "Document 10000",
  },
];
const multipleLinksIncludingSlow = [
  {
    id: 10002,
    name: "Document: 10002",
  },
  {
    id: 10004,
    name: "Document: 10004",
    initialDelayMs: 1000,
  },
  {
    id: 10006,
    name: "Document 10006",
  },
];
const multipleLinks = [
  {
    id: 10008,
    name: "Document: 10008",
  },
  {
    id: 10010,
    name: "Document: 10010",
  },
  {
    id: 10012,
    name: "Document 10012",
  },
];

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
    it.each`
      dragElementClass         | contentMocks
      ${"one-link"}            | ${oneLink}
      ${"mulitple-links-slow"} | ${multipleLinksIncludingSlow}
      ${"multiple-links"}      | ${multipleLinks}
    `(
      "[$#]: Should drag and drop $contentMocks.length non embeddable contents as links.",
      async ({ dragElementClass, contentMocks }) => {
        for (const contentMock of contentMocks) {
          await application.mockContent.addContents(contentMock);
        }

        const dragIds = contentMocks.map((content: { id: number }) => content.id);
        const droppableElement: DroppableElement = {
          label: "Drag And Drop Test",
          tooltip: "test-element",
          items: dragIds,
          classes: ["drag-content", dragElementClass],
        };
        await application.mockDragDrop.addDraggableElement(droppableElement);

        //execute drag and drop
        const dragElementSelector = `.drag-example.drag-content.${dragElementClass}`;
        const dropTargetSelector = ".ck-content.ck-editor__editable";
        await dragAndDrop(droppableElement, dragElementSelector, dropTargetSelector);

        // Validate Editing Downcast
        const { ui } = application.editor;
        const editableHandle = await ui.getEditableElement();
        await waitForExpect(async () => {
          const linkElements = await editableHandle.$$("a");
          await expect(linkElements).toHaveLength(contentMocks.length);
          for (let i = 0; i < linkElements.length; i++) {
            await expect(linkElements[i]).toHaveText(contentMocks[i].name);
          }
        });
      }
    );
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
