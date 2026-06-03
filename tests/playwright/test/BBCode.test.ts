import { ApplicationWrapper } from "./wrappers/ApplicationWrapper";
import { editor } from "./locators/editor";
import { bbCodeUrl } from "./utils/environment";
import { test } from "./base";

/**
 * Tests the BBCode feature.
 */
test("BBCode: Should show a bold word as strong-tag", async ({ page }) => {
  await page.goto(bbCodeUrl);
  await editor(page).waitFor();
  const application = new ApplicationWrapper(page);
  const { editor: editorWrapper } = application;
  await editorWrapper.setData("[b]boldword[/b]");
  await page.locator(`strong`, { hasText: "boldword" }).waitFor();
});
