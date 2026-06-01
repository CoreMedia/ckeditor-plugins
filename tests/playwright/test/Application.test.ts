import { applicationUrl } from "./utils/environment.ts";
import { editor } from "./locators/editor.ts";
import { test } from "./base.ts";

test("Application should be available", async ({ page }) => {
  await page.goto(applicationUrl);
  await editor(page).waitFor();
});
