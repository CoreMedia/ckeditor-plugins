import { expect } from "@playwright/test";

describe("Proof-of-Concept", () => {
  test("should display CKEditor", async () => {
    await page.goto("http://localhost:3000");
    await expect(page.locator(".ck-editor")).toBeVisible();
  });
});
