import { ApplicationWrapper } from "./aut/ApplicationWrapper";
import { richtext, p } from "@coremedia-internal/ckeditor5-coremedia-example-data/RichText";
import { Differencing, EOD } from "@coremedia-internal/ckeditor5-coremedia-example-data/Differencing";
import "./expect/ElementHandleExpectations";
import { PNG_BLUE_240x135 } from "@coremedia/ckeditor5-coremedia-studio-integration-mock/content/MockFixtures";
import { blobReference } from "@coremedia-internal/ckeditor5-coremedia-example-data/Images";

const xdiff = new Differencing();

/**
 * Tests the server-side differencing feature, thus, that augmented
 * data from CoreMedia Studio Server pass to Editing View, which is
 * important for later applied CSS styling (not tested here).
 *
 * The test assumes, that differencing plugin is installed to the
 * example application. Different to in-production use, where differencing
 * is only active in read-only view, the example application uses
 * differencing in R/W view. Testing editing in these cases is not
 * required and not done within this test.
 *
 * If any of these tests fail, and the behavior has to be accepted, it
 * is most likely, that CSS rules for difference highlighting have
 * to be adapted.
 */
describe("Differencing Feature", () => {
  // noinspection DuplicatedCode
  let application: ApplicationWrapper;

  beforeAll(async () => {
    application = await ApplicationWrapper.start();
    await application.goto();
    // Wait for CKEditor to be available prior to executing/continuing the tests.
    await expect(application).waitForCKEditorToBeAvailable();
  });

  afterAll(async () => {
    await application?.shutdown();
  });

  beforeEach(() => {
    application.console.open();
  });

  afterEach(() => {
    expect(application.console).toHaveNoErrorsOrWarnings();
    application.console.close();
    // Just in case, we missed to specify some EOD flag.
    xdiff.resetIds();
  });

  describe("Text Differencing", () => {
    // Test relies on attribute order for simpler assertions. Thus,
    // the test is especially not suitable for more complex attribute
    // sets.
    it.each`
      difference
      ${xdiff.add("Addition", EOD)}
      ${xdiff.del("Removal", EOD)}
      ${xdiff.change("Change", EOD)}
      ${xdiff.conflict("Conflict", EOD)}
    `("[$#] XDiff Augmentation should be available in editing view: $difference", async ({ difference }) => {
      const { editor } = application;
      const { ui } = editor;
      const editableHandle = await ui.getEditableElement();

      const text = `Lorem${difference}Ipsum`;
      const diffData = richtext(p(text));
      const dataView = await editor.setDataAndGetDataView(diffData);

      // Validate Data-Processing
      expect(dataView).toContain(text);

      // Validate Editing Downcast
      // If this fails due to order of attributes, expectations have to be
      // refactored, e.g., using toMatchAttribute.
      await expect(editableHandle).waitForInnerHtmlToContain(text);
    });

    it("All xdiff:span Attributes should be forwarded from data to editing view", async () => {
      const { editor } = application;
      const { ui } = editor;
      const editableHandle = await ui.getEditableElement();

      const conflictChangesText = "Some conflicting changes";
      const changes = [
        xdiff.add("Add"),
        xdiff.del("Del"),
        xdiff.conflict("Conflict", { changes: conflictChangesText }),
        xdiff.change("Change", EOD),
      ];
      const difference = changes.join("");

      const text = `Lorem${difference}Ipsum`;
      const diffData = richtext(p(text));
      const dataView = await editor.setDataAndGetDataView(diffData);

      // Validate Data-Processing
      expect(dataView).toContain(text);

      // Validate Editing Downcast
      await expect(editableHandle).toHaveSelectorCount("xdiff\\:span", changes.length);

      const xdiffSpanHandles = await editableHandle.$$("xdiff\\:span");

      const shouldBeAddition = xdiffSpanHandles[0];
      const shouldBeDeletion = xdiffSpanHandles[1];
      const shouldBeConflict = xdiffSpanHandles[2];
      const shouldBeChange = xdiffSpanHandles[3];

      await expect(shouldBeAddition).toMatchAttribute("xdiff:class", "diff-html-added");
      await expect(shouldBeAddition).toMatchAttribute("xdiff:id", /-0$/);
      await expect(shouldBeAddition).toMatchAttribute("xdiff:next", /-1$/);

      await expect(shouldBeDeletion).toMatchAttribute("xdiff:class", "diff-html-removed");
      await expect(shouldBeDeletion).toMatchAttribute("xdiff:id", /-1$/);
      await expect(shouldBeDeletion).toMatchAttribute("xdiff:previous", /-0$/);
      await expect(shouldBeDeletion).toMatchAttribute("xdiff:next", /-2$/);

      await expect(shouldBeConflict).toMatchAttribute("xdiff:class", "diff-html-conflict");
      await expect(shouldBeConflict).toMatchAttribute("xdiff:id", /-2$/);
      await expect(shouldBeConflict).toMatchAttribute("xdiff:previous", /-1$/);
      await expect(shouldBeConflict).toMatchAttribute("xdiff:next", /-3$/);
      await expect(shouldBeConflict).toMatchAttribute("xdiff:changes", conflictChangesText);

      await expect(shouldBeChange).toMatchAttribute("xdiff:class", "diff-html-changed");
      await expect(shouldBeChange).toMatchAttribute("xdiff:id", /-3$/);
      await expect(shouldBeChange).toMatchAttribute("xdiff:previous", /-2$/);
    });

    // This behavior is required to ease CSS styling of added/removed/... newlines.
    // If not explicitly marked as empty, CKEditor would otherwise add some filler
    // node/text, so that you can place the cursor within the element.
    it("Added newline should pass to editing view as empty element", async () => {
      const { editor } = application;
      const { ui } = editor;
      const editableHandle = await ui.getEditableElement();

      const difference = xdiff.add("", EOD);
      // This is, how added newlines are typically represented by
      // server side differencing. Here: Added newline after `Lorem`.
      const text = `${p(`Lorem${difference}`)}${p(`Ipsum`)}`;
      const diffData = richtext(text);
      const dataView = await editor.setDataAndGetDataView(diffData);

      // Validate Data-Processing
      expect(dataView).toContain(text);

      // Validate Editing Downcast
      // Here, it is important, that no filler element got added to the xdiff:span.
      await expect(editableHandle).waitForInnerHtmlToContain(difference);
    });
  });

  describe("Image Differencing", () => {
    it("img Element Augmentation by xdiff:changetype should be passed to editing view", async () => {
      const { currentTestName } = expect.getState();
      const { editor, mockContent } = application;
      const { ui } = editor;

      const id = 42;
      await mockContent.addContents({
        id,
        blob: PNG_BLUE_240x135,
        name: `Blue Image for test ${currentTestName}`,
      });

      const blobRef = blobReference(id);
      const changes = `<ul class='changelist'><li>Changed from an <b>image</b> with alt Some Image, class float--left, xlink:actuate onLoad, xlink:show embed, xlink:type simple and xlink:href ${blobRef}.</li><li>Changed to an <b>image</b> with alt Some Image, class float--right, xlink:actuate onLoad, xlink:show embed, xlink:type simple and xlink:href ${blobRef}.</li></ul>`;

      const data = richtext(
        p(
          xdiff.img(
            { type: "changed", changes, ...EOD },
            {
              alt: currentTestName,
              "xlink:href": blobRef,
              class: "float--right",
            }
          )
        )
      );

      await editor.setDataAndGetDataView(data);
      const editableHandle = await ui.getEditableElement();

      await expect(editableHandle).toHaveSelector("xdiff\\:span");

      const xdiffSpanHandle = await editableHandle.$("xdiff\\:span");

      // CKEditor Behavior: Images (at least inline-images, as we use them)
      // are wrapped by an additional span. It is also this span, which
      // receives the `xdiff:changetype` attribute in editing view, which
      // (in data) was set at the image.
      await expect(xdiffSpanHandle).toHaveSelector("span.image-inline");

      const inlineImageSpanHandle = await xdiffSpanHandle?.$("span.image-inline");

      if (!inlineImageSpanHandle) {
        const innerHtml = await xdiffSpanHandle?.innerHTML();
        // Calm static code analysis. Should not happen.
        throw new Error(
          `Unexpected: inlineImageSpanHandle is ${inlineImageSpanHandle} (innerHtml of xdiff:span: ${innerHtml}).`
        );
      }

      // Image should exist
      await expect(inlineImageSpanHandle).toHaveSelector("span > img");

      await expect(xdiffSpanHandle).toMatchAttribute("xdiff:class", "diff-html-changed");
      await expect(xdiffSpanHandle).toMatchAttribute("xdiff:changes", changes);
      await expect(inlineImageSpanHandle).toMatchAttribute("xdiff:changetype", "diff-changed-image");
    });
  });
});
