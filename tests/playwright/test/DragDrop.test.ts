import type { Page } from "playwright-core";
import { dragDropScenario } from "@coremedia/ckeditor5-itest-constants";
import { expect, test } from "./base";
import { editor } from "./locators/editor";
import { balloonPanel } from "./locators/balloon";
import { editorData, isDroppableInLinkBalloon, isDroppableState } from "./locators/outputs";
import { openStory } from "./storybook/mountStory";

const dropTargetSelector = ".ck-content.ck-editor__editable";

type DroppableResult = { isDroppable: boolean } | "PENDING" | null;
type LinkableResult = { isLinkable: boolean } | "PENDING" | null;

const dragElementSelectorFor = (dragElementClass: string): string => `.input-example.input-content.${dragElementClass}`;

/**
 * Ensures that the drop is allowed into the CKEditor.
 *
 * The dropability is evaluated continuously by the story's `is-droppable-state`
 * observable output (the dragover calculation is synchronous, while the backing
 * data retrieval is asynchronous and returns `PENDING` until resolved). We poll
 * the output locator until the asynchronous evaluation finished and reports the
 * uris as droppable, mirroring the former in-page `validateIsDroppableState`
 * poll without `page.evaluate`.
 *
 * @param page - page under test
 */
async function ensureDropAllowed(page: Page): Promise<void> {
  await expect
    .poll(async () => {
      const actual = await isDroppableState<DroppableResult>(page);
      if (!actual || actual === "PENDING") {
        return false;
      }
      return actual.isDroppable;
    })
    .toBe(true);
}

async function ensureDropInLinkBalloonAllowed(page: Page): Promise<void> {
  await expect
    .poll(async () => {
      const actual = await isDroppableInLinkBalloon<LinkableResult>(page);
      if (!actual || actual === "PENDING") {
        return false;
      }
      return actual.isLinkable;
    })
    .toBe(true);
}

async function dragAndDrop(page: Page, dragElementSelector: string): Promise<void> {
  const dragElement = page.locator(dragElementSelector);
  const dropTarget = page.locator(dropTargetSelector);
  await dragElement.waitFor();
  await dropTarget.waitFor();

  await ensureDropAllowed(page);
  await dragElement.dragTo(dropTarget);
}

/**
 * Migrated to run against the fully prepared Storybook stories
 * `tests-dragdrop--*` (see `tests/storybook/stories/tests/DragDrop.stories.ts`):
 * each story registers its mock (or external) contents and the draggable
 * input-example element, preloads the editor and exposes the dropability
 * evaluation via the `is-droppable-state` / `is-droppable-in-link-balloon`
 * observable outputs. The test only opens the matching story and drives the
 * drag-and-drop through locators — no `page.evaluate`. Image variants
 * additionally expose `editor-data`, read here with the `editorData` locator.
 */
test.describe("Drag and Drop", () => {
  test.describe("Links", () => {
    const scenarios = [
      { storyId: "tests-dragdrop--one-link", variant: dragDropScenario.links.oneLink },
      { storyId: "tests-dragdrop--slow-links", variant: dragDropScenario.links.slowLinks },
      { storyId: "tests-dragdrop--multiple-links", variant: dragDropScenario.links.multipleLinks },
    ];
    for (const [index, { storyId, variant }] of scenarios.entries()) {
      test(`[${index}]: Should drag (${variant.class}) and drop ${variant.contents.length} non embeddable contents as links.`, async ({
        page,
      }) => {
        await openStory(page, storyId);

        // execute drag and drop
        await dragAndDrop(page, dragElementSelectorFor(variant.class));

        // Validate Editing Downcast
        const linkElements = editor(page).locator("a");
        await expect(linkElements).toHaveCount(variant.contents.length);
        for (const [i, contentMock] of variant.contents.entries()) {
          await expect(linkElements.nth(i)).toContainText(contentMock.name);
        }
      });
    }
  });

  test.describe("ExternalLinks", () => {
    const scenarios = [
      { storyId: "tests-dragdrop--external-link", variant: dragDropScenario.externalLinks.externalLink },
      {
        storyId: "tests-dragdrop--already-imported-external-link",
        variant: dragDropScenario.externalLinks.alreadyImported,
      },
      {
        storyId: "tests-dragdrop--multiple-external-links",
        variant: dragDropScenario.externalLinks.multipleExternal,
      },
      {
        storyId: "tests-dragdrop--multiple-mixed-external-links",
        variant: dragDropScenario.externalLinks.multipleMixed,
      },
    ];
    for (const [index, { storyId, variant }] of scenarios.entries()) {
      test(`[${index}]: Should drag (${variant.class}) and drop ${variant.external.length} non embeddable contents as links.`, async ({
        page,
      }) => {
        await openStory(page, storyId);

        // execute drag and drop
        await dragAndDrop(page, dragElementSelectorFor(variant.class));

        // Validate Editing Downcast
        const linkElements = editor(page).locator("a");
        await expect(linkElements).toHaveCount(variant.external.length);
        for (const [i, contentMock] of variant.external.entries()) {
          await expect(linkElements.nth(i)).toContainText(contentMock.contentAfterImport?.name as string);
        }
      });
    }
  });

  test.describe("ExternalLinkIntoLinkBalloon", () => {
    test("Should render dropped content-link with name in link balloon", async ({ page }) => {
      const variant = dragDropScenario.balloon.externalContent;
      const contentMock = variant.external[0];
      await openStory(page, "tests-dragdrop--external-link-into-balloon");

      // open link balloon
      const editableElement = editor(page);
      await editableElement.click();
      await page.keyboard.press("ControlOrMeta+K");
      const { linkFormView } = balloonPanel(page);

      const inputFieldLocator = linkFormView.urlInputField;
      await inputFieldLocator.waitFor({ state: "visible" });

      // execute drag and drop
      const dragElement = page.locator(dragElementSelectorFor(variant.class));
      await dragElement.waitFor();
      await ensureDropInLinkBalloonAllowed(page);
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
      { storyId: "tests-dragdrop--one-image", variant: dragDropScenario.images.oneImage },
      { storyId: "tests-dragdrop--multiple-images", variant: dragDropScenario.images.multipleImages },
      { storyId: "tests-dragdrop--slow-images", variant: dragDropScenario.images.slowImages },
    ];
    for (const [index, { storyId, variant }] of scenarios.entries()) {
      test(`[${index}]: Should drag and drop ${variant.contents.length} embeddable contents as images.`, async ({
        page,
      }) => {
        await openStory(page, storyId);

        // execute drag and drop
        await dragAndDrop(page, dragElementSelectorFor(variant.class));

        // Validate Data-Processing
        for (const contentMock of variant.contents) {
          // noinspection HtmlUnknownAttribute
          await expect
            .poll(() => editorData(page))
            .toContain(`<img xlink:href="content/${contentMock.id}#properties.data" alt=""/>`);
        }

        // Validate Editing Downcast
        const images = editor(page).locator("img");
        await expect(images).toHaveCount(variant.contents.length);
        for (const [i, contentMock] of variant.contents.entries()) {
          await expect(images.nth(i)).toHaveAttribute("src", contentMock.blob);
          await expect(images.nth(i)).toHaveAttribute("title", contentMock.name);
        }
      });
    }
  });
});
