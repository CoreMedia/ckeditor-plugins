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
import { IsDroppableEvaluationResult } from "@coremedia/ckeditor5-coremedia-studio-integration/content/IsDroppableInRichtext";
import { MockExternalContent } from "@coremedia/ckeditor5-coremedia-studio-integration-mock/content/MockExternalContentPlugin";
import WindowBrowserAccessor from "./browser/WindowBrowserAccessor";
import { IsLinkableEvaluationResult } from "@coremedia/ckeditor5-coremedia-studio-integration/content/IsLinkableDragAndDrop";

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

const externalLink: MockExternalContent[] = [
  {
    id: 22000,
    contentAfterImport: {
      id: 22000,
      name: "Document 22000",
      type: "linkable",
    },
    isAlreadyImported: false,
    errorWhileImporting: false,
  },
];

const alreadyImportedExternalLink: MockExternalContent[] = [
  {
    id: 23000,
    contentAfterImport: {
      id: 23000,
      name: "Existing Document 23000",
      type: "linkable",
    },
    isAlreadyImported: true,
    errorWhileImporting: false,
  },
];

const multipleExternalLinks: MockExternalContent[] = [
  {
    id: 24000,
    contentAfterImport: {
      id: 24000,
      name: "Document 24000",
      type: "linkable",
    },
    isAlreadyImported: false,
    errorWhileImporting: false,
  },
  {
    id: 25000,
    contentAfterImport: {
      id: 25000,
      name: "Document 25000",
      type: "linkable",
    },
    isAlreadyImported: false,
    errorWhileImporting: false,
  },
  {
    id: 26000,
    contentAfterImport: {
      id: 26000,
      name: "Document 26000",
      type: "linkable",
    },
    isAlreadyImported: false,
    errorWhileImporting: false,
  },
];

const multipleMixedExternalLinks: MockExternalContent[] = [
  {
    id: 27000,
    contentAfterImport: {
      id: 27000,
      name: "Document 27000",
      type: "linkable",
    },
    isAlreadyImported: false,
    errorWhileImporting: false,
  },
  {
    id: 28000,
    contentAfterImport: {
      id: 28000,
      name: "Document 28000",
      type: "linkable",
    },
    isAlreadyImported: true,
    errorWhileImporting: false,
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
        const uris = contentMocks.map((contentMock: MockContentConfig) => `content/${contentMock.id}`);
        await dragAndDrop(uris, dragElementSelector, dropTargetSelector);

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

  describe("ExternalLinks", () => {
    it.each`
      dragElementClass                                       | contentMocks
      ${"external-link"}                                     | ${externalLink}
      ${"already-imported-external-link"}                    | ${alreadyImportedExternalLink}
      ${"multiple-external-links"}                           | ${multipleExternalLinks}
      ${"multiple-imported-and-not-imported-external-links"} | ${multipleMixedExternalLinks}
    `(
      "[$#]: Should drag ($dragElementClass) and drop $contentMocks.length non embeddable contents as links.",
      async ({ dragElementClass, contentMocks }) => {
        await setupExternalScenario(dragElementClass, contentMocks);

        //execute drag and drop
        const dragElementSelector = `.input-example.input-content.${dragElementClass}`;
        const dropTargetSelector = ".ck-content.ck-editor__editable";

        const uris = contentMocks.map((contentMock: MockExternalContent) => `externalUri/${contentMock.id}`);

        await dragAndDrop(uris, dragElementSelector, dropTargetSelector);

        // Validate Editing Downcast
        const { ui } = application.editor;
        const editableHandle = await ui.getEditableElement();
        await waitForExpect(async () => {
          const linkElements = await editableHandle.$$("a");
          await expect(linkElements).toHaveLength(contentMocks.length);
          for (let i = 0; i < linkElements.length; i++) {
            await expect(linkElements[i]).toHaveText(contentMocks[i].contentAfterImport.name);
          }
        });
      }
    );
  });

  describe("ExternalLinkIntoLinkBalloon", () => {
    it("Should render dropped content-link with name in link balloon", async () => {
      const { editor } = application;
      const { ui } = editor;
      const { view } = ui;

      const dragElementClass = "external-content";
      const contentMock = externalLink[0];

      // open link balloon
      const editableElement = await ui.getEditableElement();
      await editableElement.click();
      await openLinkBalloonShortcut();
      const { linkFormView } = view.body.balloonPanel;
      await setupExternalScenario(dragElementClass, [contentMock]);

      const inputFieldLocator = linkFormView.urlInputField;
      await inputFieldLocator.waitFor({ state: "visible" });
      //execute drag and drop
      const dragElementSelector = `.input-example.input-content.${dragElementClass}`;

      const uri = `externalUri/${contentMock.id}`;
      await page.waitForSelector(dragElementSelector);
      const dragElement = page.locator(dragElementSelector);
      await ensureDropInLinkBalloonAllowed([uri]);
      await dragElement.dragTo(inputFieldLocator);

      await linkFormView.save();

      // Validate Editing Downcast
      await waitForExpect(async () => {
        const name = contentMock.contentAfterImport?.name as string;
        expect(name).toBeDefined();
        if (!name) {
          return;
        }
        const linkElements = await editableElement.$$("a");
        await expect(linkElements).toHaveLength(1);
        await expect(linkElements[0]).toHaveText(name);
      });
    });
  });

  const openLinkBalloonShortcut = async () => {
    const userAgent = await WindowBrowserAccessor.getUserAgent();
    if (userAgent.includes("Mac")) {
      await page.keyboard.press("Meta+K");
    } else {
      await page.keyboard.press("Control+K");
    }
  };

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
        const uris = contentMocks.map((contentMock: MockContentConfig) => `content/${contentMock.id}`);
        await dragAndDrop(uris, dragElementSelector, dropTargetSelector);

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

  async function setupExternalScenario(
    dragElementClass: string,
    externalContentMocks: MockExternalContent[]
  ): Promise<void> {
    for (const externalContentMock of externalContentMocks) {
      await application.mockExternalContent.addContents(externalContentMock);
      if (externalContentMock.isAlreadyImported) {
        if (!externalContentMock.contentAfterImport) {
          break;
        }
        await application.mockContent.addContents(externalContentMock.contentAfterImport);
      }
    }

    const dragIds = externalContentMocks.map((content) => ({
      externalId: content.id,
    }));
    const droppableElement: InputExampleElement = {
      label: "Drag And Drop Test",
      tooltip: "test-element",
      items: dragIds,
      classes: ["input-content", dragElementClass],
    };
    await application.mockInputExamplePlugin.addInputExampleElement(droppableElement);
  }

  async function dragAndDrop(uris: string[], dragElementSelector: string, dropTargetSelector: string): Promise<void> {
    await page.waitForSelector(dragElementSelector);
    await page.waitForSelector(dropTargetSelector);
    const dragElement = page.locator(dragElementSelector);
    const dropTarget = page.locator(dropTargetSelector);

    await ensureDropAllowed(uris);
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
   * While the asynchronous call is in evaluation, "PENDING" will be returned, otherwise the result.
   * In this case we wait until the asynchronous call finished evaluating and the result is droppable.
   *
   * @param uris - the uris of the dragElement.
   */
  async function ensureDropAllowed(uris: string[]): Promise<void> {
    console.log("Waiting for contents to be available in caches and services", uris);

    await waitForExpect(async () => {
      const actual: IsDroppableEvaluationResult | undefined =
        await application.mockInputExamplePlugin.validateIsDroppableState(uris);
      expect(actual).toBeDefined();
      expect(actual).not.toEqual("PENDING");
      if (actual && actual !== "PENDING") {
        expect(actual.isDroppable).toBeTruthy();
      }
    });
  }

  async function ensureDropInLinkBalloonAllowed(uris: string[]): Promise<void> {
    console.log("Waiting for contents to be available in caches and services", uris);

    await waitForExpect(async () => {
      const actual: IsLinkableEvaluationResult | undefined =
        await application.mockInputExamplePlugin.validateIsDroppableInLinkBalloon(uris);
      expect(actual).toBeDefined();
      expect(actual).not.toEqual("PENDING");
      if (actual && actual !== "PENDING") {
        expect(actual.isLinkable).toBeTruthy();
      }
    });
  }
});
