import { start } from "./utils";
import path from "path";
import { ClassicEditorWrapper } from "./ClassicEditorWrapper";
import waitForExpect from "wait-for-expect";
import { Images } from "./Images";
import { RichTexts } from "./RichTexts";
import { Locator } from "playwright";

// This does not seem to work.
const dragFromToBoundingBox = async (from: Locator, to: Locator): Promise<void> => {
  await waitForExpect(async () => expect(await from.elementHandle()).toBeDefined());
  await waitForExpect(async () => expect(await to.elementHandle()).toBeDefined());
  const fromElement = await from.elementHandle();
  const toElement = await to.elementHandle();

  // for example: https://stackoverflow.com/questions/64718915/playwright-drag-and-drop
  const fromBox = await fromElement?.boundingBox();
  const toBox = await toElement?.boundingBox();
  if (fromBox && toBox) {
    const fromX = fromBox.x + fromBox.width / 2;
    const fromY = fromBox.y + fromBox.height / 2;

    const toX = toBox.x + toBox.width / 2;
    const toY = toBox.y + toBox.height / 2;

    console.log("Start: dragFromTo", {
      from: {
        fromX,
        fromY,
      },
      to: {
        toX,
        toY,
      },
    });

    await page.mouse.move(fromX, fromY, { steps: 5 });
    //await page.mouse.click(fromBox.x + fromBox.width / 2, fromBox.y + fromBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(toX, toY, { steps: 5 });
    await page.mouse.up();

    console.log("Done: dragFromTo", {
      from: {
        fromX,
        fromY,
      },
      to: {
        toX,
        toY,
      },
    });
  } else {
    throw new Error("BB missing");
  }
}

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

    // We must ensure to be less than JEST timeout, so that the Playwright
    // failure will win here. Otherwise, we just get failures for "test timeout"
    // from JEST. The default timeout is 30 seconds. Thus, as alternative, we may
    // increase the JEST timeout.
    // Note: The timeout is given in MILLISECONDS!
    page.setDefaultTimeout(10000);

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

  it("should provide convenience access to remote content editable DOM (as locator)", async () => {
    await expect(wrapper.editableLocator()).toHaveText("CoreMedia");
    await expect(wrapper.editableLocator().locator("h1")).toHaveText("CoreMedia");
  });

  it("should be able to type to content editable", async () => {
    await wrapper.clear();
    await wrapper.focus();
    await wrapper.editableLocator().type("Lorem");
    await expect(wrapper.editableLocator()).toHaveText("Lorem");
    expect(await wrapper.getData()).toContain("Lorem");
  });

  it("should be able to type bold text to content editable", async () => {
    await wrapper.clear();
    await wrapper.focus();
    await wrapper.execute("bold");
    await wrapper.editableLocator().type("Lorem");
    await expect(wrapper.editableLocator()).toHaveText("Lorem");
    expect(await wrapper.getData()).toContain("<strong>Lorem</strong>");
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

  it("should display image", async () => {
    const images = new Images(page);
    const base64ImageUrl = await images.rectangle();
    const imageId = 42;
    await wrapper.addContents({
      id: imageId,
      name: "Some Image",
      blob: base64ImageUrl,
    });
    const { richtext, p, img } = RichTexts;

    const data = richtext(p(img(42)));
    await wrapper.setData(data);
    const locator = wrapper.editableLocator().locator("img");
    await expect(locator).toMatchAttribute("src", base64ImageUrl);
  });

  it("should drag and drop link from external", async () => {
    await page.locator("#dragExamplesButton").click();
    console.log("Prepare to DnD, 1");
    // We should do better here. But nth-child is enough for now.
    const locator = page.locator(`#dragExamplesDiv > div:nth-child(2)`);
    //const locator = page.locator(`.drag-example[data-cmuripath="content/900"]`);
    console.log("Prepare to DnD, 2");
    await expect(locator).toHaveText("Document 1");
    console.log("Going to DnD");
    await locator.hover()
    console.log("Going to DnD, 1");
    await locator.dragTo(wrapper.editableLocator(), {
      force: true,
    });
    await dragFromToBoundingBox(locator, wrapper.editableLocator());
    console.log("Going to DnD, 2");
    await waitForExpect(() => expect(wrapper.getData()).resolves.toContain("Document 1"));
    console.log("Going to DnD, 3");
    await waitForExpect(() => expect(wrapper.getData()).resolves.toContain("Horst"));
  });

  it("should drag and drop image", async () => {
    const images = new Images(page);
    const base64ImageUrl = await images.rectangle();
    const imageId = 42;
    await wrapper.addContents({
      id: imageId,
      name: "Some Image",
      blob: base64ImageUrl,
    });
    const { richtext, p, img, th, td, tr, trHeader, table } = RichTexts;

    const data = richtext(
      table(
        [
          trHeader([
            th("Source"),
            th("Target"),
          ].join("")),
          tr([
            td(p(img(42), { class: "source" }), { class: "source" }),
            td(p("", { class: "target" }), { class: "target" }),
          ].join(""))
        ].join("")
      )
    );
    const expectedData = richtext(
      table(
        [
          trHeader([
            th("Source"),
            th("Target"),
          ].join("")),
          tr([
            td(p("", { class: "source" }), { class: "source" }),
            td(p(img(42), { class: "target" }), { class: "target" }),
          ].join(""))
        ].join("")
      )
    );
    await wrapper.setData(data);

    const locator = wrapper.editableLocator().locator("img");
    // We may need to wait, until the image is available.
    await expect(locator).toMatchAttribute("src", base64ImageUrl);

    const html = await wrapper.editableHtml();
    console.log(`Editable HTML: ${html}`);

    console.log("Accessing draggable, Simple");
    const sourceProbeSimple = await wrapper.editableLocator().locator(`span.image-inline`);
    const probeHtml = await sourceProbeSimple.innerHTML();
    console.log(`Accessing draggable, Simple, HTML: ${probeHtml}`);

    console.log("Going to DnD");
    const mode: number = 4;
    switch (mode) {
      case 0:
        const source0 = await wrapper.editableLocator().locator(`img`);
        const target0 = await wrapper.editableLocator().locator("p.target");
        console.log("Click source");
        await source0.hover();
        await source0.click();
        console.log("DragTo target");
        await source0.dragTo(target0, {
          force: true
        });
        console.log("DnD done.");
        break;
      case 1:
        const source1 = await wrapper.editableLocator().locator("img").elementHandle();
        const target1 = await wrapper.editableLocator().locator("p.target").elementHandle();
        if (source1 && target1) {
          const sb1 = await source1.boundingBox();
          const tb1 = await target1.boundingBox();
          if (sb1 && tb1) {
            await page.mouse.move(sb1.x + sb1.width / 2, sb1.y + sb1.height / 2);
            await page.mouse.click(sb1.x + sb1.width / 2, sb1.y + sb1.height / 2);
            await page.mouse.down();
            await page.mouse.move(tb1.x + tb1.width / 2, tb1.y + tb1.height / 2);
            await page.mouse.up();
          } else {
            throw new Error("BB missing");
          }
        } else {
          throw new Error("handles missing");
        }
        break;
      case 2:
        const source2 = await page.$(`div.ck[contenteditable="true"] span.image-inline`);
        const target2 = await page.$(`div.ck[contenteditable="true"] p.target`);
        if (source2 && target2) {
          const sb2 = await source2.boundingBox();
          const tb2 = await target2.boundingBox();
          if (sb2 && tb2) {
            await page.mouse.move(sb2.x + sb2.width / 2, sb2.y + sb2.height / 2);
            await page.mouse.click(sb2.x + sb2.width / 2, sb2.y + sb2.height / 2);
            await page.mouse.down();
            await page.mouse.move(tb2.x + tb2.width / 2, tb2.y + tb2.height / 2);
            await page.mouse.up();
          } else {
            throw new Error("BB missing");
          }
        } else {
          throw new Error("handles missing");
        }
        break;
      case 3:
        const source3 = await wrapper.editableLocator().locator("span.image-inline").elementHandle();
        const target3 = await wrapper.editableLocator().locator("p.target").elementHandle();
        if (source3 && target3) {
          console.log(`Drag from ${await source3.innerHTML()} to ${await target3.innerHTML()}`)
          const sb3 = await source3.boundingBox();
          const tb3 = await target3.boundingBox();
          if (sb3 && tb3) {
            await page.mouse.move(sb3.x + sb3.width / 2, sb3.y + sb3.height / 2);
            await page.mouse.click(sb3.x + sb3.width / 2, sb3.y + sb3.height / 2);
            await page.mouse.down();
            await page.mouse.move(tb3.x + tb3.width / 2, tb3.y + tb3.height / 2);
            await page.mouse.up();
          } else {
            throw new Error("BB missing");
          }
        } else {
          throw new Error("handles missing");
        }
        break;
      case 4:
        await page.dragAndDrop("//span[contains(@class, 'image-inline')]/img", "//p.target", {
          force: true
        });
        break;
      default:
        throw Error(`Unsupported mode ${mode}`);
    }
    expect(await wrapper.editableHtml()).toBe("");
    expect(await wrapper.getData()).toBe(expectedData);
  });

  afterAll(async () => {
    shutdown && await shutdown();
  });
});
