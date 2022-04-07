import path from "path";
import { start } from "./utils";

let shutdown: () => Promise<void>;
let baseUrl: URL;
let indexUrl: URL;

describe("HelloWorld", () => {
  beforeAll(async () => {
    const startResult = await start(path.resolve("../"));
    shutdown = startResult.shutdown;
    baseUrl = startResult.baseUrl;
    indexUrl = startResult.indexUrl;
  });

  it("should have the correct lang attribute", async () => {
    await page.goto(indexUrl.toString());
    const lang = await page.$eval(".ck-editor", (el) => el.getAttribute("lang"));
    expect(lang).toBe("en");
  });

  it.skip("should have the correct lang attribute (failure provoked)", async () => {
    await page.goto(indexUrl.toString());
    const lang = await page.$eval(".ck-editor", (el) => el.getAttribute("lang"));
    expect(lang).toBe("de");
  });

  afterAll(async () => {
    shutdown && await shutdown();
  });
});
