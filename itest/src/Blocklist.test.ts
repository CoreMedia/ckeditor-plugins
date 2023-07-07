import { ApplicationWrapper } from "./aut/ApplicationWrapper";
import { richtext } from "@coremedia-internal/ckeditor5-coremedia-example-data/src/RichTextBase";
import "./expect/Expectations";
import WindowBrowserAccessor from "./browser/WindowBrowserAccessor";

/**
 * Tests the blocklist feature.
 *
 * In this test, a word gets added and removed again.
 * During these steps, the ui in the blocklist balloon
 * and the markers in the editor text are validated.
 */
describe("Blocklist", () => {
  let application: ApplicationWrapper;

  beforeAll(async () => {
    application = await ApplicationWrapper.start();
    await application.goto();
    await expect(application).waitForCKEditorToBeAvailable();
  });

  afterAll(async () => {
    await application?.shutdown();
  });

  beforeEach(() => {
    application.console.open();
  });

  afterEach(() => {
    expect(application.console).toHaveNoErrorsOrWarnings();
    application.console.close();
  });

  describe("Blocklist", () => {
    it("AddToBlocklist and RemoveFromBlocklist adds and removes markers", async () => {
      const { editor } = application;
      const { ui } = editor;
      const { view } = ui;

      // Initialize editor
      const data = richtext(`<p>Hello World!</p><p>Content</p><p>This is an example text for test purposes.</p>`);
      await editor.setData(data);
      const helloWorldText = view.locator.locator(`p`, { hasText: "Hello World!" });

      // Click into editor
      const contentText = view.locator.locator(`p`, { hasText: "Content" });
      const modifiers = await clickModifiers();
      await contentText.click({ modifiers });

      // Open Blocklist Balloon via Shortcut
      const userAgent = await WindowBrowserAccessor.getUserAgent();
      const metaKey = userAgent.includes("Mac") ? "Meta" : "Control";
      await page.keyboard.down(metaKey);
      await page.keyboard.down("Shift");
      await page.keyboard.press("B");

      // Make sure balloon and input are visible
      const { input, submitButton } = editor.ui.view.body.balloonPanel.blocklistActionsView;
      await expect(input).waitToBeVisible();
      await expect(await submitButton.locator.isDisabled()).toBeTruthy();

      // Add "content" to list of blocked words
      await input.locator.fill("content");
      await expect(await submitButton.locator.isEnabled()).toBeTruthy();
      await submitButton.locator.click();

      // Input should be cleared and button should be disabled
      await expect(await submitButton.locator.isDisabled()).toBeTruthy();
      await expect(await input.locator.inputValue()).toBe("");

      // Hide balloon
      await helloWorldText.click({ modifiers });

      const highlightMarker = view.locator.locator(`span[data-blocklist-word]`);
      await expect(highlightMarker).toHaveText("Content");

      // Balloon opens when user clicks on highlighted word
      await highlightMarker.click({ modifiers });
      await expect(input).waitToBeVisible();

      const { removeButton, blockedWordLabel } = editor.ui.view.body.balloonPanel.blocklistActionsView;

      // Highlighted word is visible
      await expect(blockedWordLabel).waitToBeVisible();
      //await expect(blockedWordLabel).toHaveText("content");
      await expect(removeButton).waitToBeVisible();

      // Remove highlighted word
      await removeButton.locator.click();

      // The Highlight Markers are gone now
      await expect((await page.locator(`span[data-blocklist-word]`).count()) === 0).toBeTruthy();
    });
  });
});

type ClickModifiers = "Meta" | "Control";

const clickModifiers = async (): Promise<ClickModifiers[]> => ((await isMac()) ? ["Meta"] : ["Control"]);

const isMac = async (): Promise<boolean> => {
  const response = String(await page.evaluate(() => navigator.userAgent));
  return response.includes("Mac");
};
