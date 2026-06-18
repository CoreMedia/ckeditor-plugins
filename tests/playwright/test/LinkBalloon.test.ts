import { contentUriPath } from "@coremedia/ckeditor5-coremedia-studio-integration";
import { a, p, richtext } from "@coremedia-internal/ckeditor5-coremedia-example-data";
import type { Page } from "playwright-core";
import { expect, test } from "./base";
import { editor } from "./locators/editor";
import { balloonPanel } from "./locators/balloon";
import { openStory } from "./storybook/mountStory";
import { addMockContents, setEditorData } from "./storybook/testApi";

/**
 * Id of a draggable element. Clicking it (or starting a drag) is used to verify
 * the link balloon close behavior.
 */
const draggableDivId = "draggable-element-for-link-balloon-test";

/**
 * Id of an element configured in CKEditor to keep the link balloon open on click.
 */
const configuredClickKeepOpenDivId = "example-to-keep-the-link-balloon-open-on-click";

/**
 * Class of an element configured in CKEditor to keep the link balloon open on click.
 */
const configuredClickKeepOpenDivClass = "example-class-to-keep-the-link-balloon-open-on-click";

const injectDraggable = (page: Page): Promise<void> =>
  page.evaluate((draggableId) => {
    const draggableDiv = document.createElement("div");
    draggableDiv.draggable = true;
    draggableDiv.id = draggableId;
    draggableDiv.style.width = "50px";
    draggableDiv.style.height = "50px";
    draggableDiv.style.backgroundColor = "#00FF00";
    document.body.appendChild(draggableDiv);
  }, draggableDivId);

/**
 * Creates a div element with an id configured in CKEditor to not close the link balloon
 * on click.
 */
const injectKeepOpenWithIdDiv = (page: Page): Promise<void> =>
  page.evaluate((id) => {
    const htmlDivElement = document.createElement("div");
    htmlDivElement.id = id;
    htmlDivElement.style.width = "50px";
    htmlDivElement.style.height = "50px";
    htmlDivElement.style.backgroundColor = "#FF0000";
    document.body.appendChild(htmlDivElement);
  }, configuredClickKeepOpenDivId);

/**
 * Creates a div element with a class configured in CKEditor to not close the link balloon
 * on click.
 */
const injectKeepOpenWithClassDiv = (page: Page): Promise<void> =>
  page.evaluate((aClass) => {
    const htmlDivElementWithClass = document.createElement("div");
    htmlDivElementWithClass.id = "unknownId";
    htmlDivElementWithClass.classList.add(aClass);
    htmlDivElementWithClass.style.width = "50px";
    htmlDivElementWithClass.style.height = "50px";
    htmlDivElementWithClass.style.backgroundColor = "#00FF00";
    document.body.appendChild(htmlDivElementWithClass);
  }, configuredClickKeepOpenDivClass);

/**
 * Migrated to run against the Storybook story `tests-linkballoon--default`
 * (see `tests/storybook/stories/tests/LinkBalloon.stories.ts`) instead of the
 * former example application.
 */
const storyId = "tests-linkballoon--default";

test.describe("Link Balloon", () => {
  test.beforeEach(async ({ page }) => {
    await openStory(page, storyId);
    await injectDraggable(page);
    await injectKeepOpenWithIdDiv(page);
    await injectKeepOpenWithClassDiv(page);
  });

  test.describe("Close behavior on click on other elements", () => {
    test("Should stay open when click on configured element id or element class", async ({ page }, testInfo) => {
      const name = testInfo.title;
      const editable = editor(page);
      const id = 42;
      await addMockContents(page, {
        id,
        name: `Document for test ${name}`,
      });

      const dataLink = contentUriPath(id);
      const data = richtext(p(a(name, { "xlink:href": dataLink })));
      await setEditorData(page, data);
      // Open the balloon
      const contentLink = editable.locator(`a`, { hasText: name });
      await contentLink.click();

      const { linkToolbarView } = balloonPanel(page);
      // The balloon should pop up on click.
      await expect(linkToolbarView.locator).toBeVisible();

      await page.locator(`#${configuredClickKeepOpenDivId}`).click();
      await expect(linkToolbarView.locator).toBeVisible();

      await page.locator(`.${configuredClickKeepOpenDivClass}`).click();
      await expect(linkToolbarView.locator).toBeVisible();
    });

    test("Should close when click on draggable element", async ({ page }, testInfo) => {
      const name = testInfo.title;
      const editable = editor(page);
      const id = 42;
      await addMockContents(page, {
        id,
        name: `Document for test ${name}`,
      });

      const dataLink = contentUriPath(id);
      const data = richtext(p(a(name, { "xlink:href": dataLink })));
      await setEditorData(page, data);
      // Open the balloon
      const contentLink = editable.locator(`a`, { hasText: name });
      await contentLink.click();

      const { linkToolbarView } = balloonPanel(page);
      // The balloon should pop up on click.
      await expect(linkToolbarView.locator).toBeVisible();

      await page.locator(`#${draggableDivId}`).click();
      await expect(linkToolbarView.locator).toBeHidden();
    });

    test("Should stay open when mousedown on draggable element", async ({ page }, testInfo) => {
      const name = testInfo.title;
      const editable = editor(page);
      const id = 42;
      await addMockContents(page, {
        id,
        name: `Document for test ${name}`,
      });

      const dataLink = contentUriPath(id);
      const data = richtext(p(a(name, { "xlink:href": dataLink })));
      await setEditorData(page, data);
      // Open the balloon
      const contentLink = editable.locator(`a`, { hasText: name });
      await contentLink.click();

      const { linkToolbarView } = balloonPanel(page);
      // The balloon should pop up on click.
      await expect(linkToolbarView.locator).toBeVisible();

      await page.locator(`#${draggableDivId}`).hover();
      await page.mouse.down();
      await expect(linkToolbarView.locator).toBeVisible();
    });
  });
});
