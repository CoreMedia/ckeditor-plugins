import { test } from "@playwright/test";
import { applicationUrl } from "./utils/environment.ts";
import { editor } from "./locators/editor.ts";

test("Application should be available", async ({ page }) => {
  await page.goto(applicationUrl);
  await editor(page).waitFor();
});
