import { richtext } from "@coremedia-internal/ckeditor5-coremedia-example-data";
import type {
  InputExampleElement,
  MockContentConfig,
} from "@coremedia-internal/ckeditor5-coremedia-studio-integration-mock";
import type { Page } from "playwright-core";
import { expect, test } from "./base";
import { editor } from "./locators/editor";
import { applicationUrl } from "./utils/environment";
import { ApplicationWrapper } from "./wrappers/ApplicationWrapper";
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

const targetSelector = ".ck-toolbar__items";

const setupScenario = async (
  application: ApplicationWrapper,
  inputElementClass: string,
  contentMocks: MockContentConfig[],
): Promise<void> => {
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
};

const copyPaste = async (page: Page, inputElementSelector: string, toolbarItemsLocator: string): Promise<void> => {
  await page.locator(inputElementSelector).waitFor();
  await page.locator(toolbarItemsLocator).waitFor();
  const inputElement = page.locator(inputElementSelector);
  await inputElement.dblclick();
  const pasteContentButton = page.locator(toolbarItemsLocator).locator(".paste-content-button");
  await pasteContentButton.waitFor();
  await pasteContentButton.click();
};

test.describe("Paste Button", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(applicationUrl);
    await editor(page).waitFor();

    // setup initial data
    const application = new ApplicationWrapper(page);
    await application.editor.setDataAndGetDataView(richtext());
  });

  test.describe("Links", () => {
    const cases: { inputElementClass: string; contentMocks: MockContentConfig[]; name: string }[] = [
      { inputElementClass: "one-link", contentMocks: oneLink, name: "one link" },
      { inputElementClass: "multiple-links-slow", contentMocks: multipleLinksIncludingSlow, name: "slow links" },
      { inputElementClass: "multiple-links", contentMocks: multipleLinks, name: "multiple links" },
    ];

    for (const { inputElementClass, contentMocks, name } of cases) {
      test(`Should paste ${name} (non embeddable contents as links).`, async ({ page }) => {
        const application = new ApplicationWrapper(page);
        await setupScenario(application, inputElementClass, contentMocks);

        const inputElementSelector = `.input-example.input-content.${inputElementClass}`;
        await copyPaste(page, inputElementSelector, targetSelector);

        // Validate Editing Downcast
        const linkElements = editor(page).locator("a");
        await expect(linkElements).toHaveCount(contentMocks.length);
        for (let i = 0; i < contentMocks.length; i++) {
          await expect(linkElements.nth(i)).toContainText(contentMocks[i].name as string);
        }
      });
    }

    test("Should paste a link using keyboard shorcut.", async ({ page }) => {
      const inputElementClass = "paste-via-keyboard-link";
      const contentMock = oneLink;
      const application = new ApplicationWrapper(page);
      await setupScenario(application, inputElementClass, contentMock);

      const inputElementSelector = `.input-example.input-content.${inputElementClass}`;
      await page.locator(inputElementSelector).dblclick();
      await application.editor.ui.locator.click();
      // `ControlOrMeta` resolves to Meta on macOS and Control elsewhere.
      await page.keyboard.press("ControlOrMeta+Shift+P");

      const contentName: string = contentMock[0].name as string;
      await page.getByRole("link", { name: contentName }).waitFor();
    });
  });

  test.describe("Images", () => {
    const cases: { inputElementClass: string; contentMocks: MockContentConfig[]; name: string }[] = [
      { inputElementClass: "one-image", contentMocks: oneImage, name: "one image" },
      { inputElementClass: "multiple-images", contentMocks: multipleImages, name: "multiple images" },
      { inputElementClass: "multiple-images-slow", contentMocks: multipleImagesSlow, name: "slow images" },
    ];

    for (const { inputElementClass, contentMocks, name } of cases) {
      test(`Should paste ${name} (embeddable contents as images).`, async ({ page }) => {
        const application = new ApplicationWrapper(page);
        const { editor: editorWrapper } = application;
        await setupScenario(application, inputElementClass, contentMocks);

        // execute paste
        const inputElementSelector = `.input-example.input-content.${inputElementClass}`;
        await copyPaste(page, inputElementSelector, targetSelector);

        // Validate Editing Downcast
        for (const contentMock of contentMocks) {
          // noinspection HtmlUnknownAttribute
          await expect
            .poll(() => editorWrapper.getData())
            .toContain(`<img xlink:href="content/${contentMock.id}#properties.data" alt=""/>`);
        }

        const images = editor(page).locator("img");
        await expect(images).toHaveCount(contentMocks.length);
        for (let i = 0; i < contentMocks.length; i++) {
          await expect(images.nth(i)).toHaveAttribute("src", contentMocks[i].blob as string);
          await expect(images.nth(i)).toHaveAttribute("title", contentMocks[i].name as string);
        }
      });
    }
  });
});
