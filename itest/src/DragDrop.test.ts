import { ApplicationWrapper } from "./aut/ApplicationWrapper";
import { richtext } from "@coremedia-internal/ckeditor5-coremedia-example-data/RichText";
import "./expect/Expectations";
import { InputExampleElement } from "@coremedia/ckeditor5-coremedia-studio-integration-mock/content/MockInputExamplePlugin";
import waitForExpect from "wait-for-expect";
import { MockContentConfig } from "@coremedia/ckeditor5-coremedia-studio-integration-mock/content/MockContent";
import {
  PNG_BLUE_240x135,
  PNG_GREEN_240x135,
  PNG_RED_240x135,
} from "@coremedia/ckeditor5-coremedia-studio-integration-mock/content/MockFixtures";
import { Locator } from "playwright";
import { IsDroppableResponse } from "@coremedia/ckeditor5-coremedia-studio-integration/content/IsDroppableInRichtext";

const oneLink: MockContentConfig[] = [
  {
    id: 10000,
    name: "Document 10000",
  },
];

const multipleLinksIncludingSlow: MockContentConfig[] = [
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

const multipleLinks: MockContentConfig[] = [
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

const oneImage: MockContentConfig[] = [
  {
    id: 100014,
    name: "Document 100014",
    blob: PNG_RED_240x135,
    embeddable: true,
    linkable: true,
  },
];

const multipleImages: MockContentConfig[] = [
  {
    id: 100016,
    name: "Document 100016",
    blob: PNG_RED_240x135,
    embeddable: true,
    linkable: true,
  },
  {
    id: 100018,
    name: "Document 100018",
    blob: PNG_BLUE_240x135,
    embeddable: true,
    linkable: true,
  },
  {
    id: 100020,
    name: "Document 100020",
    blob: PNG_GREEN_240x135,
    embeddable: true,
    linkable: true,
  },
];

const multipleImagesSlow: MockContentConfig[] = [
  {
    id: 100022,
    name: "Document 100022",
    blob: PNG_RED_240x135,
    embeddable: true,
    linkable: true,
  },
  {
    id: 100024,
    name: "Document 100024",
    blob: PNG_BLUE_240x135,
    initialDelayMs: 1000,
    embeddable: true,
    linkable: true,
  },
  {
    id: 100026,
    name: "Document 100026",
    blob: PNG_GREEN_240x135,
    embeddable: true,
    linkable: true,
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
      ${"multiple-links-slow"} | ${multipleLinksIncludingSlow}
      ${"multiple-links"}      | ${multipleLinks}
    `(
      "[$#]: Should drag ($dragElementClass) and drop $contentMocks.length non embeddable contents as links.",
      async ({ dragElementClass, contentMocks }) => {
        await setupScenario(dragElementClass, contentMocks);

        //execute drag and drop
        const dragElementSelector = `.input-example.input-content.${dragElementClass}`;
        const dropTargetSelector = ".ck-content.ck-editor__editable";
        await dragAndDrop(contentMocks, dragElementSelector, dropTargetSelector);

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
    it.each`
      dragElementClass          | contentMocks
      ${"one-image"}            | ${oneImage}
      ${"multiple-images"}      | ${multipleImages}
      ${"multiple-images-slow"} | ${multipleImagesSlow}
    `(
      "[$#]: Should drag and drop $contentMocks.length embeddable contents as images.",
      async ({ dragElementClass, contentMocks }) => {
        await setupScenario(dragElementClass, contentMocks);

        //execute drag and drop
        const dragElementSelector = `.input-example.input-content.${dragElementClass}`;
        const dropTargetSelector = ".ck-content.ck-editor__editable";
        await dragAndDrop(contentMocks, dragElementSelector, dropTargetSelector);

        // Validate Editing Downcast
        const { ui } = application.editor;
        await waitForExpect(async () => {
          const data = await application.editor.getData();
          for (const contentMock of contentMocks) {
            // noinspection HtmlUnknownAttribute
            await expect(data).toContain(`<img alt="" xlink:href="content/${contentMock.id}#properties.data"/>`);
          }
        });

        const editableHandle = await ui.getEditableElement();
        await waitForExpect(async () => {
          const images = await editableHandle.$$("img");
          await expect(images).toHaveLength(contentMocks.length);
          for (let i = 0; i < images.length; i++) {
            const image = images[i];
            await expect(image).toMatchAttribute("src", contentMocks[i].blob);
            await expect(image).toMatchAttribute("title", contentMocks[i].name);
          }
        });
      }
    );
  });

  async function setupScenario(dragElementClass: string, contentMocks: MockContentConfig[]): Promise<void> {
    for (const contentMock of contentMocks) {
      await application.mockContent.addContents(contentMock);
    }

    const dragIds = contentMocks.map((content: { id: number }) => content.id);
    const droppableElement: InputExampleElement = {
      label: "Drag And Drop Test",
      tooltip: "test-element",
      items: dragIds,
      classes: ["input-content", dragElementClass],
    };
    await application.mockInputExamplePlugin.addInputExampleElement(droppableElement);
  }

  async function dragAndDrop(
    contentMocks: MockContentConfig[],
    dragElementSelector: string,
    dropTargetSelector: string
  ): Promise<void> {
    await page.waitForSelector(dragElementSelector);
    await page.waitForSelector(dropTargetSelector);
    const dragElement = page.locator(dragElementSelector);
    const dropTarget = page.locator(dropTargetSelector);

    await ensureDropAllowed(
      dragElement,
      dropTarget,
      contentMocks.map((contentMock) => `content/${contentMock.id}`)
    );
    await dragElement.dragTo(dropTarget);
  }

  /**
   * Ensures that the drop is allowed into the CKEditor.
   *
   * This contains some implementation knowledge. The "dragover" calculates if the drop is allowed or not.
   * While the "dragover" is a synchronous event the data retrieval for the calculation is asynchronous.
   * "dragover" will be executed many times while hovering over the CKEditor and on entering the CKEditor the asynchronous
   * fetch is triggered. The result will be stored. The next "dragover" will be calculated using those data.
   *
   * While in the asynchronous call is in evaluation "PENDING" will be returned, otherwise the result.
   * In this case we wait until the asynchronous call finished evaluating and the result is droppable.
   *
   * @param dragElement - the element to drag
   * @param dropTarget - the target to drop the dragElement to.
   * @param uris - the uris of the dragElement.
   */
  async function ensureDropAllowed(dragElement: Locator, dropTarget: Locator, uris: string[]): Promise<void> {
    const dragElementBoundingBox = await dragElement.boundingBox();
    if (!dragElementBoundingBox) {
      return Promise.reject(`Element to drag not found for selector ${JSON.stringify(dragElement)}`);
    }

    //Initiate the first call by hovering the drop target with the dragged element.
    await page.mouse.move(dragElementBoundingBox.x, dragElementBoundingBox.y);
    await page.mouse.down();
    await dropTarget.hover();

    console.log("Waiting for contents to be available in caches and services", uris);

    await waitForExpect(async () => {
      const actual: IsDroppableResponse | undefined = await application.mockInputExamplePlugin.validateIsDroppableState(
        uris
      );
      expect(actual).toBeDefined();
      expect(actual).not.toEqual("PENDING");
      if (actual && actual !== "PENDING") {
        expect(actual.areDroppable).toBeTruthy();
      }
    });
  }
});
