import { externalLinkUrl, linkUserInteractionScenario } from "@coremedia/ckeditor5-itest-constants";
import { expect, test } from "./base";
import { editor } from "./locators/editor";
import { lastOpenedEntities } from "./locators/outputs";
import { openStory } from "./storybook/mountStory";

const { externalLink, externalLinkReadOnly, contentLink, contentLinkReadOnly } = linkUserInteractionScenario;

const storyId = (id: string): string => `tests-linkuserinteraction--${id}`;

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
 * Migrated to run against the fully prepared Storybook stories
 * `tests-linkuserinteraction--*` (see
 * `tests/storybook/stories/tests/LinkUserInteraction.stories.ts`): each story
 * bakes the link data, the backing mock content and the read-only state, so the
 * test only opens the story and drives the link through locators — no
 * `page.evaluate`. Content-link openings are read through the
 * `last-opened-entities` output. The literals are shared via
 * `@coremedia/ckeditor5-itest-constants`.
 */
test.describe("Link User Interaction", () => {
  test.describe("External Link Actions", () => {
    test("Should open in new browser tab on (Ctrl | Meta) + click", async ({ page }) => {
      await openStory(page, storyId(externalLink.id));
      const externalLinkLocator = editor(page).locator(`a`, { hasText: externalLink.linkText });

      const newTabPromise = page.context().waitForEvent("page");
      // `ControlOrMeta` resolves to Meta on macOS and Control elsewhere.
      await externalLinkLocator.click({ modifiers: ["ControlOrMeta"] });
      const newTab = await newTabPromise;
      expect(newTab.url()).toBe(externalLinkUrl);
      await newTab.close();
    });

    test("Should open in new browser tab on Alt + Enter", async ({ page }) => {
      await openStory(page, storyId(externalLink.id));
      const externalLinkLocator = editor(page).locator(`a`, { hasText: externalLink.linkText });

      const newTabPromise = page.context().waitForEvent("page");
      await externalLinkLocator.click();
      await page.keyboard.down("Alt");
      await page.keyboard.press("Enter");
      const newTab = await newTabPromise;
      expect(newTab.url()).toBe(externalLinkUrl);
      await newTab.close();
    });

    test("Read-Only: Should open in new browser tab on click", async ({ page }) => {
      await openStory(page, storyId(externalLinkReadOnly.id));
      const contentLinkLocator = editor(page).locator(`a`, { hasText: externalLinkReadOnly.linkText });

      const newTabPromise = page.context().waitForEvent("page");
      await contentLinkLocator.click();
      const newTab = await newTabPromise;
      expect(newTab.url()).toBe(externalLinkUrl);
      await newTab.close();
    });

    test("Read-Only: Should open in new browser tab on (Ctrl | Meta) + click", async ({ page }) => {
      await openStory(page, storyId(externalLinkReadOnly.id));
      const contentLinkLocator = editor(page).locator(`a`, { hasText: externalLinkReadOnly.linkText });

      const newTabPromise = page.context().waitForEvent("page");
      // `ControlOrMeta` resolves to Meta on macOS and Control elsewhere.
      await contentLinkLocator.click({ modifiers: ["ControlOrMeta"] });
      const newTab = await newTabPromise;
      expect(newTab.url()).toBe(externalLinkUrl);
      await newTab.close();
    });
  });

  test.describe("Content Link Actions", () => {
    test("Should open in new work area tab on (Ctrl | Meta) + click", async ({ page }) => {
      await openStory(page, storyId(contentLink.id));
      const contentLinkLocator = editor(page).locator(`a`, { hasText: contentLink.linkText });

      // `ControlOrMeta` resolves to Meta on macOS and Control elsewhere.
      await contentLinkLocator.click({ modifiers: ["ControlOrMeta"] });
      await expect.poll(() => lastOpenedEntities(page)).toEqual(contentLink.expectedOpenedEntities);
    });

    test("Should open in new work area tab on Alt+Enter", async ({ page }) => {
      await openStory(page, storyId(contentLink.id));
      const contentLinkLocator = editor(page).locator(`a`, { hasText: contentLink.linkText });

      await contentLinkLocator.click();
      await page.keyboard.down("Alt");
      await page.keyboard.press("Enter");

      await expect.poll(() => lastOpenedEntities(page)).toEqual(contentLink.expectedOpenedEntities);
    });

    test("Read-Only: Should open in new work area tab on click", async ({ page }) => {
      await openStory(page, storyId(contentLinkReadOnly.id));
      const contentLinkLocator = editor(page).locator(`a`, { hasText: contentLinkReadOnly.linkText });

      await contentLinkLocator.click();
      await expect.poll(() => lastOpenedEntities(page)).toEqual(contentLinkReadOnly.expectedOpenedEntities);
    });

    test("Read-Only: Should open in new work area tab on (Ctrl | Meta) + click", async ({ page }) => {
      await openStory(page, storyId(contentLinkReadOnly.id));
      const contentLinkLocator = editor(page).locator(`a`, { hasText: contentLinkReadOnly.linkText });

      // `ControlOrMeta` resolves to Meta on macOS and Control elsewhere.
      await contentLinkLocator.click({ modifiers: ["ControlOrMeta"] });
      await expect.poll(() => lastOpenedEntities(page)).toEqual(contentLinkReadOnly.expectedOpenedEntities);
    });
  });
});
