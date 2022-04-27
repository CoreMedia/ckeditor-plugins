import { test as pwTest, expect, JSHandle, Page } from "@playwright/test";
// import { CKEditorPage } from "./models/CKEditorPage";

interface ClassicEditor {
  getData(): string;
  setData(value: string): string;
}

interface HoldsEditor {
  editor: ClassicEditor;
}

export class CKEditorPage {
  readonly #page: Page;
  readonly #baseUrl: string;

  constructor(page: Page, baseUrl: string | undefined) {
    this.#page = page;
    this.#baseUrl = baseUrl ?? "http://localhost:3000";
  }

  async window(): Promise<JSHandle<Window>> {
    return await this.#page.evaluateHandle(() => window);
  }

  async editor(): Promise<JSHandle<ClassicEditor>> {
    return await this.#page.evaluateHandle(() => (<HoldsEditor>(<unknown>window)).editor);
  }

  async goto(): Promise<void> {
    await this.#page.goto(this.#baseUrl);
  }

  async setData(data: string): Promise<void> {
    const editor = await this.editor();
    await this.#page.evaluate(({ editor: e, data: d }) => e.setData(d), {
      editor,
      data,
    });
  }

  // Used to provoke slow responses, and thus see, how we may wait for this.
  async setDataSlow(data: string): Promise<void> {
    const editor = await this.editor();
    await this.#page.evaluate(({ editor: e, data: d }) => window.setTimeout(() => e.setData(d), 60000), {
      editor,
      data,
    });
  }

  async getData(): Promise<string> {
    const editor = await this.editor();
    const data = await this.#page.evaluate((e) => e.getData(), editor);
    return data;
  }

  async expectData(predicate: (data: string) => boolean = () => true): Promise<string> {
    return new Promise<string>(async (resolve) => {
      const editor = await this.editor();
      while (true) {
        const data = await this.#page.evaluate((e) => e.getData(), editor);
        if (predicate(data)) {
          return resolve(data);
        }
      }
    });
  }
}

/*
 * TODO:
 *   * Use expectData(string) in PageObject for async behavior?
 *   * Use custom textarea added on the fly to hold values, we may later query by locators?
 */

// https://playwright.dev/docs/test-fixtures
const test = pwTest.extend<{ editorPage: CKEditorPage }>({
  editorPage: async ({ page, baseURL }, use) => {
    const editorPage = new CKEditorPage(page, baseURL);
    await editorPage.goto();
    await use(editorPage);
  },
});

test.describe("Basic CKEditor Validation", () => {
  test("Should render CKEditor", async ({ page, baseURL }) => {
    await page.goto(baseURL ?? "http://localhost:3000");
    await expect(page.locator(".ck-editor")).toBeVisible();
    await page.locator(".ck-editor").screenshot({ path: "test-results/ckeditor.png" });
  });

  test("Using Wrapper to Access Data", async ({ page, baseURL }) => {
    const editorPage = new CKEditorPage(page, baseURL);
    await editorPage.goto();
    const data = await editorPage.getData();
    expect(data).toContain("http://www.coremedia.com/2003/richtext-1.0");
  });

  test("Using Wrapper via Test-Fixture to Access Data", async ({ editorPage }) => {
    const data = await editorPage.getData();
    expect(data).toContain("http://www.coremedia.com/2003/richtext-1.0");
  });

  test("Using Wrapper to Set Data", async ({ page, baseURL }) => {
    const editorPage = new CKEditorPage(page, baseURL);
    await editorPage.goto();
    await editorPage.setDataSlow("");
    const data = await editorPage.getData();
    // Most likely bad, as it is not asynchronous anymore.
    expect(data).toStrictEqual("");
  });

  test("Using Wrapper to Set Data 2", async ({ page, baseURL }) => {
    const editorPage = new CKEditorPage(page, baseURL);
    await editorPage.goto();
    await editorPage.setDataSlow("");
    // Inner await: Wait for value
    // Expect Await: Wait for value to match... this internally uses JEST async behavior, which again is wrong here, as it just waits for the promise to resolve, not for the promise to have a given value.
    await expect(editorPage.getData()).resolves.toStrictEqual("");
  });

  test("Using Wrapper to Set Data 3", async ({ editorPage }) => {
    await editorPage.setDataSlow("");
    // Inner await: Wait for value
    // This kind'a works but is very hacky. It also does not use Playwright Timeouts but JEST Timeouts (which are what?)
    // The only timeout which is handled by Playwright here, is the test-timeout (global) instead of a timeout for expectations
    await expect(editorPage.expectData((d) => d === "")).resolves.toStrictEqual("");
  });

  test("Using Wrapper to Set Data 4", async ({ editorPage }) => {
    await editorPage.setDataSlow("");
    const data = await editorPage.expectData((d) => d === "");
    // Similar to the above. Timeout applies to the whole test only, not a single statement.
    // In other words: We would have to to implement our own wait-mechanism or learn or to
    // extend the wait-pattern for Playwright.
    expect(data).toStrictEqual("");
  });
});
