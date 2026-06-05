import { p, richtext } from "@coremedia-internal/ckeditor5-coremedia-example-data";
import { expect, test } from "./base";
import { editor } from "./locators/editor";
import { applicationUrl } from "./utils/environment";
import { ApplicationWrapper } from "./wrappers/ApplicationWrapper";

/**
 * Tests the blocklist feature with a collapsed selection.
 */
test("Blocklist: Collapsed selection shows balloon", async ({ page }) => {
  await page.goto(applicationUrl);
  await editor(page).waitFor();

  const application = new ApplicationWrapper(page);

  const blockedWord = "thisisablockedword";
  const serviceAgent = application.mockServiceAgent;
  await serviceAgent.getBlocklistServiceWrapper().addWord(blockedWord);

  const data = richtext(`${p("Hello World!")}${p(blockedWord)}${p("This is an example text for test purposes.")}`);
  await application.editor.setData(data);

  const view = application.editor.ui.view;
  const blockedWordMarker = view.locator.locator(`span[data-blocklist-word]`);
  await expect(blockedWordMarker).toHaveText(blockedWord);

  // `ControlOrMeta` resolves to Meta on macOS and Control elsewhere.
  const modifiers: "ControlOrMeta"[] = ["ControlOrMeta"];
  await blockedWordMarker.click({ modifiers });

  const { input, submitButton } = view.body.balloonPanel.blocklistActionsView;
  await expect(input.locator).toBeVisible();
  await expect(submitButton.locator).toBeDisabled();
});
