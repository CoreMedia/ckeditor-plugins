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

  it("should provide `editor` as global instance after CKEditor initialized", () => {
    expect(wrapper.editor()).resolves.toBeTruthy();
  });

  it("should provide data", () => {
    // noinspection HttpUrlsUsage
    expect(wrapper.getData()).resolves.toContain("http://www.coremedia.com/2003/richtext-1.0");
  });

  it("should update data", async () => {
    await wrapper.setData("");
    expect(await wrapper.getData()).toBe("");
  });

  it("should work for slow AUT", async () => {
    await wrapper.setDataSlow("");
    // A tiny library, which helps us to wait for something to happen.
    await waitForExpect(() => expect(wrapper.getData()).resolves.toBe(""));
  });

  afterAll(async () => {
    shutdown && await shutdown();
  });
});
