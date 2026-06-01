import { test } from "@playwright/test";

test("Application should be available", async ({ page }) => {
  await page.getByRole("textbox", { name: "Rich Text Editor" });
});
