import { richtext } from "@coremedia-internal/ckeditor5-coremedia-example-data";
import "./expect/Expectations";
import type { InputExampleElement, MockContentConfig } from "@coremedia/ckeditor5-coremedia-studio-integration-mock";
import waitForExpect from "wait-for-expect";
import { ApplicationWrapper } from "./aut/ApplicationWrapper";
import { ctrlOrMeta } from "./browser/UserAgent";
import { PNG_BLUE_240x135, PNG_GREEN_240x135, PNG_RED_240x135 } from "./MockFixtures";

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

describe("Paste Button", () => {
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
  const targetSelector = ".ck-toolbar__items";

  describe("Links", () => {
    it.each`
      inputElementClass        | contentMocks
      ${"one-link"}            | ${oneLink}
      ${"multiple-links-slow"} | ${multipleLinksIncludingSlow}
      ${"multiple-links"}      | ${multipleLinks}
    `(
      "[$#]: Should paste $contentMocks.length non embeddable contents as links.",
      async ({ inputElementClass, contentMocks }) => {
        await setupScenario(inputElementClass, contentMocks);

        const inputElementSelector = `.input-example.input-content.${inputElementClass}`;
        await copyPaste(contentMocks, inputElementSelector, targetSelector);

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
      },
    );
    it("Should paste a link using keyboard shorcut.", async () => {
      const inputElementClass = "paste-via-keyboard-link";
      const contentMock = oneLink;
      await setupScenario(inputElementClass, contentMock);

      const inputElementSelector = `.input-example.input-content.${inputElementClass}`;
      await page.locator(inputElementSelector).dblclick();
      await application.editor.ui.locator.click();
      const controlOrMeta = await ctrlOrMeta();
      await page.keyboard.press(`${controlOrMeta}+Shift+P`);
      // Validate Editing Downcast
      const { ui } = application.editor;
      const editableHandle = await ui.getEditableElement();
      const linkElements = await editableHandle.$$("a");

      await waitForExpect(async () => {
        await expect(linkElements).toHaveLength(1);
        if (contentMock[0].name) {
          const contentName: string = contentMock[0].name as string;
          await expect(linkElements[0]).toHaveText(contentName);
        }
      });
    });
  });

  describe("Images", () => {
    it.each`
      inputElementClass         | contentMocks
      ${"one-image"}            | ${oneImage}
      ${"multiple-images"}      | ${multipleImages}
      ${"multiple-images-slow"} | ${multipleImagesSlow}
    `(
      "[$#]: Should paste $contentMocks.length embeddable contents as images.",
      async ({ inputElementClass, contentMocks }) => {
        await setupScenario(inputElementClass, contentMocks);

        //execute paste
        const inputElementSelector = `.input-example.input-content.${inputElementClass}`;
        await copyPaste(contentMocks, inputElementSelector, targetSelector);

        // Validate Editing Downcast
        const { ui } = application.editor;
        await waitForExpect(async () => {
          const data = await application.editor.getData();
          for (const contentMock of contentMocks) {
            // noinspection HtmlUnknownAttribute
            await expect(data).toContain(`<img xlink:href="content/${contentMock.id}#properties.data" alt=""/>`);
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
      },
    );
  });

  async function setupScenario(inputElementClass: string, contentMocks: MockContentConfig[]): Promise<void> {
    for (const contentMock of contentMocks) {
      await application.mockContent.addContents(contentMock);
    }

    const inputIds = contentMocks.map((content: { id: number }) => content.id);
    const inputElement: InputExampleElement = {
      label: "Paste Test",
      tooltip: "test-element",
      items: inputIds,
      classes: ["input-content", inputElementClass],
    };
    await application.mockInputExamplePlugin.addInputExampleElement(inputElement);
  }

  async function copyPaste(
    contentMocks: MockContentConfig[],
    inputElementSelector: string,
    toolbarItemsLocator: string,
  ): Promise<void> {
    await page.waitForSelector(inputElementSelector);
    await page.waitForSelector(toolbarItemsLocator);
    const inputElement = page.locator(inputElementSelector);
    await inputElement.dblclick();
    const pasteContentButton = page.locator(toolbarItemsLocator).locator(".paste-content-button");
    await expect(pasteContentButton).toBeEnabled();
    await pasteContentButton.click();
  }
});
