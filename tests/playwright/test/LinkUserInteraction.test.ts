import { a, p, richtext } from "@coremedia-internal/ckeditor5-coremedia-example-data";
import { contentUriPath } from "@coremedia/ckeditor5-coremedia-studio-integration";
import { expect, test } from "./base";
import { editor } from "./locators/editor";
import { openStory } from "./storybook/mountStory";
import { addMockContents, getLastOpenedEntities, setEditorData, setReadOnly } from "./storybook/testApi";

const externalLinkUrl = "https://www.coremedia.com/";

/**
 * Tests mouse and keyboard interaction with links in ckeditor.
 *
 * There are two different cases: Read only and read write.
 * In read only ckeditor must open links on click in a new browser tab
 * or in case it is a content link in a new work area tab.
 *
 * In read write a normal click opens the link balloon but Ctrl (or Meta for Mac)
 * opens the link in a new tab. For content's it has to be a new work area tab, otherwise
 * the same page would be opened in a new browser tab (as the anchor href is #).
 * Furthermore, in read write the same behavior is implemented as keyboard shortcut alt+enter.
 *
 * Migrated to run against the Storybook story `tests-linkuserinteraction--default`
 * (see `tests/storybook/stories/tests/LinkUserInteraction.stories.ts`) instead
 * of the former example application. Editor data, mock contents, read-only state
 * and service-agent assertions go through the in-page editor test API.
 */
const storyId = "tests-linkuserinteraction--default";

test.describe("Link User Interaction", () => {
  test.beforeEach(async ({ page }) => {
    await openStory(page, storyId);
  });

  test.describe("External Link Actions", () => {
    test("Should open in new browser tab on (Ctrl | Meta) + click", async ({ page }, testInfo) => {
      const name = testInfo.title;
      const editable = editor(page);

      const data = richtext(p(a(name, { "xlink:href": externalLinkUrl })));
      await setEditorData(page, data);

      const externalLink = editable.locator(`a`, { hasText: name });

      const newTabPromise = page.context().waitForEvent("page");
      // `ControlOrMeta` resolves to Meta on macOS and Control elsewhere.
      await externalLink.click({ modifiers: ["ControlOrMeta"] });
      const newTab = await newTabPromise;
      expect(newTab.url()).toBe(externalLinkUrl);
      await newTab.close();
    });

    test("Should open in new browser tab on Alt + Enter", async ({ page }, testInfo) => {
      const name = testInfo.title;
      const editable = editor(page);

      const data = richtext(p(a(name, { "xlink:href": externalLinkUrl })));
      await setEditorData(page, data);

      const externalLink = editable.locator(`a`, { hasText: name });

      const newTabPromise = page.context().waitForEvent("page");
      await externalLink.click();
      await page.keyboard.down("Alt");
      await page.keyboard.press("Enter");
      const newTab = await newTabPromise;
      expect(newTab.url()).toBe(externalLinkUrl);
      await newTab.close();
    });

    test("Read-Only: Should open in new browser tab on click", async ({ page }, testInfo) => {
      const name = testInfo.title;
      const editable = editor(page);

      const data = richtext(p(a(name, { "xlink:href": externalLinkUrl })));
      await setEditorData(page, data);
      await setReadOnly(page, true);
      const contentLink = editable.locator(`a`, { hasText: name });

      const newTabPromise = page.context().waitForEvent("page");
      await contentLink.click();
      const newTab = await newTabPromise;
      expect(newTab.url()).toBe(externalLinkUrl);
      await newTab.close();
    });

    test("Read-Only: Should open in new browser tab on (Ctrl | Meta) + click", async ({ page }, testInfo) => {
      const name = testInfo.title;
      const editable = editor(page);

      const data = richtext(p(a(name, { "xlink:href": externalLinkUrl })));
      await setEditorData(page, data);
      await setReadOnly(page, true);
      const contentLink = editable.locator(`a`, { hasText: name });

      const newTabPromise = page.context().waitForEvent("page");
      // `ControlOrMeta` resolves to Meta on macOS and Control elsewhere.
      await contentLink.click({ modifiers: ["ControlOrMeta"] });
      const newTab = await newTabPromise;
      expect(newTab.url()).toBe(externalLinkUrl);
      await newTab.close();
    });
  });

  test.describe("Content Link Actions", () => {
    test("Should open in new work area tab on (Ctrl | Meta) + click", async ({ page }, testInfo) => {
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

      const contentLink = editable.locator(`a`, { hasText: name });

      // `ControlOrMeta` resolves to Meta on macOS and Control elsewhere.
      await contentLink.click({ modifiers: ["ControlOrMeta"] });
      expect(await getLastOpenedEntities(page)).toEqual(["content/42"]);
    });

    test("Should open in new work area tab on Alt+Enter", async ({ page }, testInfo) => {
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

      const contentLink = editable.locator(`a`, { hasText: name });

      await contentLink.click();
      await page.keyboard.down("Alt");
      await page.keyboard.press("Enter");

      expect(await getLastOpenedEntities(page)).toEqual(["content/42"]);
    });

    test("Read-Only: Should open in new work area tab on click", async ({ page }, testInfo) => {
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
      await setReadOnly(page, true);

      const contentLink = editable.locator(`a`, { hasText: name });
      await contentLink.click();
      expect(await getLastOpenedEntities(page)).toEqual(["content/42"]);
    });

    test("Read-Only: Should open in new work area tab on (Ctrl | Meta) + click", async ({ page }, testInfo) => {
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
      await setReadOnly(page, true);

      const contentLink = editable.locator(`a`, { hasText: name });
      // `ControlOrMeta` resolves to Meta on macOS and Control elsewhere.
      await contentLink.click({ modifiers: ["ControlOrMeta"] });
      expect(await getLastOpenedEntities(page)).toEqual(["content/42"]);
    });
  });
});
