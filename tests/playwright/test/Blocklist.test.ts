import type { Page } from "playwright-core";
import { p, richtext } from "@coremedia-internal/ckeditor5-coremedia-example-data";
import { expect, test } from "./base";
import { editor } from "./locators/editor";
import { balloonPanel } from "./locators/balloon";
import { openStory } from "./storybook/mountStory";
import { setEditorData } from "./storybook/testApi";

const useOpenBlocklistShortcut = async (page: Page): Promise<void> => {
  // Open Blocklist Balloon via Shortcut
  await page.keyboard.down("ControlOrMeta");
  await page.keyboard.down("Shift");
  await page.keyboard.press("B");
};

/**
 * Tests the blocklist feature.
 *
 * In this test, a word gets added and removed again.
 * During these steps, the ui in the blocklist balloon
 * and the markers in the editor text are validated.
 *
 * Migrated to run against the Storybook story `tests-blocklist--default`
 * (see `tests/storybook/stories/tests/Blocklist.stories.ts`) instead of the
 * former example application.
 */
const storyId = "tests-blocklist--default";

test("AddToBlocklist and RemoveFromBlocklist adds and removes markers", async ({ page }) => {
  await openStory(page, storyId);

  const editable = editor(page);

  // Initialize editor
  const data = richtext(`(${p("Hello World!")}${p("Content")}${p("This is an example text for test purposes.")}`);
  await setEditorData(page, data);
  const helloWorldText = editable.locator(`p`, { hasText: "Hello World!" });

  // Click into editor
  const contentText = editable.locator(`p`, { hasText: "Content" });
  // `ControlOrMeta` resolves to Meta on macOS and Control elsewhere.
  const modifiers: "ControlOrMeta"[] = ["ControlOrMeta"];
  await contentText.click({ modifiers });

  // Open Blocklist Balloon via Shortcut
  await useOpenBlocklistShortcut(page);

  // Make sure balloon and input are visible
  const { input, submitButton } = balloonPanel(page).blocklistActionsView;
  await expect(input.locator).toBeVisible();
  await expect(submitButton.locator).toBeDisabled();

  // Add "content" to list of blocked words
  await input.locator.fill("content");
  await expect(submitButton.locator).toBeEnabled();
  await submitButton.locator.click();

  // Input should be cleared and button should be disabled
  await expect(submitButton.locator).toBeDisabled();
  await expect(input.locator).toHaveValue("");

  // Hide balloon
  await helloWorldText.click({ modifiers });

  const highlightMarker = editable.locator(`span[data-blocklist-word]`);
  await expect(highlightMarker).toHaveText("Content");

  // Balloon opens when user clicks on highlighted word
  await highlightMarker.click({ modifiers });
  await expect(input.locator).toBeVisible();

  const { removeButton, blockedWordLabel } = balloonPanel(page).blocklistActionsView;

  // Highlighted word is visible
  await expect(blockedWordLabel.locator).toBeVisible();
  //await expect(blockedWordLabel.locator).toHaveText("content");
  await expect(removeButton.locator).toBeVisible();

  // Remove highlighted word
  await removeButton.locator.click();

  // The Highlight Markers are gone now
  await expect(page.locator(`span[data-blocklist-word]`)).toHaveCount(0);
});
