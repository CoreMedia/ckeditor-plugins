import { start } from "./utils";
import path from "path";
import { ClassicEditorWrapper } from "./ClassicEditorWrapper";
import waitForExpect from "wait-for-expect";

/**
 * Demonstrate how to access the `ClassicEditor` instance, which we store
 * as global constant `editor` in the example application.
 */
describe("HelloClassicEditor", () => {
  let shutdown: () => Promise<void>;
  let wrapper: ClassicEditorWrapper;

  beforeAll(async () => {
    const startResult = await start(path.resolve("../"));
    shutdown = startResult.shutdown;

    // Example how to access the log. Could also be used for
    // asserting "no errors".
    page.on("console", async msg => {
      const type = msg.type();
      const values = async () => {
        const result = [`Page:`];
        for (const arg of msg.args()) {
          try {
            const value = await arg.jsonValue();
            result.push(value);
          } catch (e: unknown) {
            result.push(`<failed to unwrap: ${e}>`);
          }
        }
        return result;
      }

      switch (type) {
        case "log":
          console.log(...await values());
          break;
        case "debug":
          console.debug(...await values());
          break;
        case "warn":
          console.warn(...await values());
          break;
        case "error":
          console.error(...await values());
          break;
        default:
        // ignore things like startGroup, endGroup, ...
      }
    });

    wrapper = new ClassicEditorWrapper(page, startResult.indexUrl);
    await wrapper.goto();
  });

  it("should provide `editor` as global instance after CKEditor initialized", async () => {
    expect(await wrapper.editor()).toBeTruthy();
  });

  it("should provide data", async () => {
    // noinspection HttpUrlsUsage
    expect(await wrapper.getData()).toContain("http://www.coremedia.com/2003/richtext-1.0");
  });

  it("should update data", async () => {
    await wrapper.clear();
    expect(await wrapper.getData()).toBe("");
  });

  it("should work for slow AUT", async () => {
    await wrapper.setDataSlow("");
    // A tiny library, which helps us to wait for something to happen.
    await waitForExpect(() => expect(wrapper.getData()).resolves.toBe(""));
  });

  it("should provide access to content editable", async () => {
    expect(await wrapper.editable()).toBeDefined();
  });

  it("should provide convenience access to remote content editable DOM (as string)", async () => {
    expect(await wrapper.editableHtml()).toContain("CoreMedia");
    // Matches some expected class at content-editable.
    expect(await wrapper.editableHtml("outerHTML")).toContain("ck-content");
  });

  it("should provide convenience access to remote content editable DOM (as locator)", () => {
    expect(wrapper.editableLocator()).toHaveText("CoreMedia");
    expect(wrapper.editableLocator().locator("h1")).toHaveText("CoreMedia");
  });

  it("should be able to type to content editable", async () => {
    await wrapper.clear();
    await wrapper.focus();
    await wrapper.editableLocator().type("Lorem");
    await expect(wrapper.editableLocator()).toHaveText("Lorem");
    expect(await wrapper.getData()).toContain("Lorem");
  });

  it.each`
  character | expectedData
  ${`<`} | ${`&lt;`}
  ${`>`} | ${`&gt;`}
  ${`&`} | ${`&amp;`}
  ${`"`} | ${`"`}
  `("[$#] should represent typed '$character' in data as: '$expectedData'' ", async ({ character, expectedData }) => {
    const text = `B${character}E`;
    const textInData = `B${expectedData}E`;
    await wrapper.clear();
    await wrapper.focus();
    await wrapper.editableLocator().type(text);
    expect(await wrapper.getData()).toContain(textInData);
  });

  afterAll(async () => {
    shutdown && await shutdown();
  });
});
