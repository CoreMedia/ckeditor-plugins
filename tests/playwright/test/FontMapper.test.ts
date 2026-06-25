import * as fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Page } from "playwright-core";
import { expect, test } from "./base";
import { editor } from "./locators/editor";
import { openStory } from "./storybook/mountStory";
import { editorData } from "./locators/outputs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const CHARACTER_PLACEHOLDER = "{PLACE_HOLDER}";

interface ClipboardItemConfig {
  type: string;
  content: string;
}

/**
 * Writes the given item config to the browser clipboard.
 *
 * Port of the former `ClipboardBrowserAccessor.write`, using the `page`
 * fixture instead of the jest-playwright global `page`.
 *
 * @param page - page under test
 * @param itemConfig - the item config to create the clipboard item from
 */
const writeToClipboard = async (page: Page, itemConfig: ClipboardItemConfig): Promise<void> => {
  await page.evaluate(async (itemToCopy): Promise<void> => {
    const requireClipboardPermission = async (
      name: "read" | "write",
      expectedState: PermissionState = "granted",
    ): Promise<void> => {
      const permissionName = `clipboard-${name}`;
      // @ts-expect-error - Bad typing for supported permission names.
      const permission = await navigator.permissions.query({ name: permissionName });
      if (permission.state !== expectedState) {
        throw Error(
          `Insufficient permission for ${permissionName}: expected: ${expectedState}, actual: ${permission.state}`,
        );
      }
    };

    await requireClipboardPermission("write");

    // Blob and ClipboardItem are only available in the browser, therefore, we
    // have to create Blob and ClipboardItem in the same function where we write
    // it to the clipboard.
    const blob = new Blob([itemToCopy.content], { type: itemToCopy.type });
    const clipboardItem = new ClipboardItem({
      [itemToCopy.type]: blob,
    });
    try {
      await navigator.clipboard.write([clipboardItem]);
      console.debug("Triggered write to clipboard.", { ...itemToCopy });
    } catch (e) {
      console.debug("Failed writing to clipboard.", { ...itemToCopy }, e);
      throw e;
    }

    await requireClipboardPermission("read");

    // Some debugging/fail-early approach.
    const actualItemConfigs: { type: string; content: string }[] = [];
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        for (const itemType of item.types) {
          const itemBlob = await item.getType(itemType);
          const itemText = await itemBlob.text();
          actualItemConfigs.push({ type: itemType, content: itemText });
        }
      }
    } catch (e) {
      console.debug("Failed reading clipboard.", e);
    }

    if (actualItemConfigs.length === 0) {
      throw new Error(
        `Unexpected state: Clipboard (length: ${actualItemConfigs.length}) does not contain expected data, thus failed writing to clipboard: ${itemToCopy.type}: ${itemToCopy.content}`,
      );
    }
  }, itemConfig);
};

/**
 * Selects all content in the currently focused element and replaces it by
 * pasting from the clipboard.
 *
 * Port of the former `ReplaceAllPasteAction.execute`. Uses Playwright's
 * `"ControlOrMeta"` modifier instead of user-agent sniffing.
 *
 * @param page - page under test
 */
const replaceAllPaste = async (page: Page): Promise<void> => {
  const { keyboard } = page;
  const press = (key: string): Promise<unknown> => Promise.all([keyboard.down(key), keyboard.up(key)]);
  await Promise.all([keyboard.down("ControlOrMeta"), press("a"), press("v"), keyboard.up("ControlOrMeta")]);
};

/**
 * Runs against the fully prepared Storybook story `tests-fontmapper--default`
 * (see `tests/storybook/stories/tests/FontMapper.stories.ts`): the editor
 * exposes its live data via the `editor-data` observable output, so the test
 * asserts the mapped content through the `editorData` locator and focuses the
 * editor via a locator click — no editor-API `page.evaluate`. The clipboard
 * write below still uses `page.evaluate`, as writing a `text/html` clipboard
 * item is a browser-platform action with no Playwright locator equivalent.
 */
const storyId = "tests-fontmapper--default";

test.describe("Font Mapper features", () => {
  test.beforeEach(async ({ page }) => {
    await openStory(page, storyId);
  });

  /**
   * Test for the FontMapper Plugin.
   *
   * The FontMapper Plugin replaces characters for the Symbol-Font
   * (or a configured font) to be displayable in the browser.
   *
   * For this test, a Word-document in HTML exists which contains a placeholder.
   * The placeholder is set to a location where the symbol font is applied and
   * has to be replaced with the symbol-character to test.
   * Those symbol-characters are the input for the test.
   */
  const wordDocumentTemplatePaths = [
    "test-data/font-mapper/word-template.html",
    "test-data/font-mapper/word-template-table.html",
    "test-data/font-mapper/word-template-table-inherit-font.html",
  ];
  for (const wordDocumentTemplatePath of wordDocumentTemplatePaths) {
    test(`Should render ∃ when pasted from word document ${wordDocumentTemplatePath}`, async ({ page }) => {
      const expected = "∃";
      const input = "$";
      const wordDocumentTemplate = fs.readFileSync(path.join(__dirname, "..", wordDocumentTemplatePath)).toString();
      const wordDocumentWithSymbol = wordDocumentTemplate.replace(CHARACTER_PLACEHOLDER, input);
      await editor(page).click();
      await writeToClipboard(page, { type: "text/html", content: wordDocumentWithSymbol });

      await editor(page).click();
      await replaceAllPaste(page);

      /*
       * -----------------------------------------------------------------------
       * Validating that the symbol is replaced by the FontMapper plugin.
       * -----------------------------------------------------------------------
       */
      await expect.poll(() => editorData(page)).toContain(expected);
    });
  }
});
