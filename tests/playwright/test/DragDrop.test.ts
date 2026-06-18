import { richtext } from "@coremedia-internal/ckeditor5-coremedia-example-data";
import type {
  InputExampleElement,
  MockContentConfig,
  MockExternalContent,
} from "@coremedia-internal/ckeditor5-coremedia-studio-integration-mock";
import type { Page } from "playwright-core";
import { expect, test } from "./base";
import { editor } from "./locators/editor";
import { balloonPanel } from "./locators/balloon";
import { openStory } from "./storybook/mountStory";
import {
  addInputExampleElement,
  addMockContents,
  addMockExternalContents,
  getEditorData,
  setEditorData,
  validateIsDroppableInLinkBalloon,
  validateIsDroppableState,
} from "./storybook/testApi";
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

const dropTargetSelector = ".ck-content.ck-editor__editable";

/**
 * Migrated to run against the Storybook story `tests-dragdrop--default`
 * (see `tests/storybook/stories/tests/DragDrop.stories.ts`) instead of the
 * former example application.
 */
const storyId = "tests-dragdrop--default";

test.describe("Drag and Drop", () => {
  test.beforeEach(async ({ page }) => {
    await openStory(page, storyId);

    // setup initial data
    await setEditorData(page, richtext());
  });

  test.describe("Links", () => {
    const scenarios = [
      { dragElementClass: "one-link", contentMocks: oneLink },
      { dragElementClass: "multiple-links-slow", contentMocks: multipleLinksIncludingSlow },
      { dragElementClass: "multiple-links", contentMocks: multipleLinks },
    ];
    for (const [index, { dragElementClass, contentMocks }] of scenarios.entries()) {
      test(`[${index}]: Should drag (${dragElementClass}) and drop ${contentMocks.length} non embeddable contents as links.`, async ({
        page,
      }) => {
        await setupScenario(page, dragElementClass, contentMocks);

        // execute drag and drop
        const dragElementSelector = `.input-example.input-content.${dragElementClass}`;
        const uris = contentMocks.map((contentMock) => `content/${contentMock.id}`);
        await dragAndDrop(page, uris, dragElementSelector, dropTargetSelector);

        // Validate Editing Downcast
        const linkElements = editor(page).locator("a");
        await expect(linkElements).toHaveCount(contentMocks.length);
        for (const [i, contentMock] of contentMocks.entries()) {
          await expect(linkElements.nth(i)).toContainText(contentMock.name as string);
        }
      });
    }
  });

  test.describe("ExternalLinks", () => {
    const scenarios = [
      { dragElementClass: "external-link", contentMocks: externalLink },
      { dragElementClass: "already-imported-external-link", contentMocks: alreadyImportedExternalLink },
      { dragElementClass: "multiple-external-links", contentMocks: multipleExternalLinks },
      {
        dragElementClass: "multiple-imported-and-not-imported-external-links",
        contentMocks: multipleMixedExternalLinks,
      },
    ];
    for (const [index, { dragElementClass, contentMocks }] of scenarios.entries()) {
      test(`[${index}]: Should drag (${dragElementClass}) and drop ${contentMocks.length} non embeddable contents as links.`, async ({
        page,
      }) => {
        await setupExternalScenario(page, dragElementClass, contentMocks);

        // execute drag and drop
        const dragElementSelector = `.input-example.input-content.${dragElementClass}`;
        const uris = contentMocks.map((contentMock) => `externalUri/${contentMock.id}`);
        await dragAndDrop(page, uris, dragElementSelector, dropTargetSelector);

        // Validate Editing Downcast
        const linkElements = editor(page).locator("a");
        await expect(linkElements).toHaveCount(contentMocks.length);
        for (const [i, contentMock] of contentMocks.entries()) {
          await expect(linkElements.nth(i)).toContainText(contentMock.contentAfterImport?.name as string);
        }
      });
    }
  });

  test.describe("ExternalLinkIntoLinkBalloon", () => {
    test("Should render dropped content-link with name in link balloon", async ({ page }) => {
      const dragElementClass = "external-content";
      const contentMock = externalLink[0];

      // open link balloon
      const editableElement = editor(page);
      await editableElement.click();
      await page.keyboard.press("ControlOrMeta+K");
      const { linkFormView } = balloonPanel(page);
      await setupExternalScenario(page, dragElementClass, [contentMock]);

      const inputFieldLocator = linkFormView.urlInputField;
      await inputFieldLocator.waitFor({ state: "visible" });

      // execute drag and drop
      const dragElementSelector = `.input-example.input-content.${dragElementClass}`;
      const uri = `externalUri/${contentMock.id}`;
      const dragElement = page.locator(dragElementSelector);
      await dragElement.waitFor();
      await ensureDropInLinkBalloonAllowed(page, [uri]);
      await dragElement.dragTo(inputFieldLocator);

      await linkFormView.save();

      // Validate Editing Downcast
      const name = contentMock.contentAfterImport?.name as string;
      const linkElements = editableElement.locator("a");
      await expect(linkElements).toHaveCount(1);
      await expect(linkElements.first()).toContainText(name);
    });
  });

  test.describe("Images", () => {
    const scenarios = [
      { dragElementClass: "one-image", contentMocks: oneImage },
      { dragElementClass: "multiple-images", contentMocks: multipleImages },
      { dragElementClass: "multiple-images-slow", contentMocks: multipleImagesSlow },
    ];
    for (const [index, { dragElementClass, contentMocks }] of scenarios.entries()) {
      test(`[${index}]: Should drag and drop ${contentMocks.length} embeddable contents as images.`, async ({
        page,
      }) => {
        await setupScenario(page, dragElementClass, contentMocks);

        // execute drag and drop
        const dragElementSelector = `.input-example.input-content.${dragElementClass}`;
        const uris = contentMocks.map((contentMock) => `content/${contentMock.id}`);
        await dragAndDrop(page, uris, dragElementSelector, dropTargetSelector);

        // Validate Data-Processing
        for (const contentMock of contentMocks) {
          // noinspection HtmlUnknownAttribute
          await expect
            .poll(() => getEditorData(page))
            .toContain(`<img xlink:href="content/${contentMock.id}#properties.data" alt=""/>`);
        }

        // Validate Editing Downcast
        const images = editor(page).locator("img");
        await expect(images).toHaveCount(contentMocks.length);
        for (const [i, contentMock] of contentMocks.entries()) {
          await expect(images.nth(i)).toHaveAttribute("src", contentMock.blob as string);
          await expect(images.nth(i)).toHaveAttribute("title", contentMock.name as string);
        }
      });
    }
  });
});

async function setupScenario(page: Page, dragElementClass: string, contentMocks: MockContentConfig[]): Promise<void> {
  for (const contentMock of contentMocks) {
    await addMockContents(page, contentMock);
  }

  const dragIds = contentMocks.map((content) => content.id);
  const droppableElement: InputExampleElement = {
    label: "Drag And Drop Test",
    tooltip: "test-element",
    items: dragIds,
    classes: ["input-content", dragElementClass],
  };
  await addInputExampleElement(page, droppableElement);
}

async function setupExternalScenario(
  page: Page,
  dragElementClass: string,
  externalContentMocks: MockExternalContent[],
): Promise<void> {
  for (const externalContentMock of externalContentMocks) {
    await addMockExternalContents(page, [externalContentMock]);
    if (externalContentMock.isAlreadyImported) {
      if (!externalContentMock.contentAfterImport) {
        break;
      }
      await addMockContents(page, externalContentMock.contentAfterImport);
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
  await addInputExampleElement(page, droppableElement);
}

async function dragAndDrop(
  page: Page,
  uris: string[],
  dragElementSelector: string,
  dropTargetSelector: string,
): Promise<void> {
  const dragElement = page.locator(dragElementSelector);
  const dropTarget = page.locator(dropTargetSelector);
  await dragElement.waitFor();
  await dropTarget.waitFor();

  await ensureDropAllowed(page, uris);
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
 * @param page - page under test
 * @param uris - the uris of the dragElement.
 */
async function ensureDropAllowed(page: Page, uris: string[]): Promise<void> {
  await expect
    .poll(async () => {
      const actual = await validateIsDroppableState(page, uris);
      if (!actual || actual === "PENDING") {
        return false;
      }
      return actual.isDroppable;
    })
    .toBe(true);
}

async function ensureDropInLinkBalloonAllowed(page: Page, uris: string[]): Promise<void> {
  await expect
    .poll(async () => {
      const actual = await validateIsDroppableInLinkBalloon(page, uris);
      if (!actual || actual === "PENDING") {
        return false;
      }
      return actual.isLinkable;
    })
    .toBe(true);
}
