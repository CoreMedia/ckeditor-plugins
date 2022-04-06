import path from "path";
import { Page } from "playwright";
import { start } from "./utils";

let shutdown: () => Promise<void>;
let page: Page;
let baseUrl: URL;

beforeAll(async () => {
  const startResult = await start(path.resolve("../"));
  shutdown = startResult.shutdown;
  page = startResult.page;
  baseUrl = startResult.baseUrl;
});

test('should have the correct lang attribute', async () => {
  await page.goto(new URL("/sample/index.html", baseUrl).toString());
  const lang = await page.$eval(".ck-editor", (el) => el.getAttribute("lang"));
  expect(lang).toBe("en");
});

afterAll(async () => {
  shutdown && await shutdown();
});
