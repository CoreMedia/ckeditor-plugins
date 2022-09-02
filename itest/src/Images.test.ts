import { ApplicationWrapper } from "./aut/ApplicationWrapper";
import { PNG_RED_240x135 } from "@coremedia/ckeditor5-coremedia-studio-integration-mock/content/MockFixtures";
import "./expect/Expectations";
import { ImageStyleBalloonAction } from "./user-interaction/ImageStyleBalloonAction";
import { ElementHandle } from "playwright-core";
import { blobReference } from "@coremedia-internal/ckeditor5-coremedia-example-data/Images";
import { img, p, richtext } from "@coremedia-internal/ckeditor5-coremedia-example-data/RichText";

describe("Image Features", () => {
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
  });

  /**
   * This test is especially a regression test for CoreMedia/ckeditor-plugins#65,
   * which is, that after upgrade from CKEditor 32.0.0 to 34.0.0 images provided
   * by CMS were not detected anymore but appeared as _HTML Objects_ provided
   * by General HTML Support rather than as InlineImage objects.
   *
   * As this regression test has also been used for debugging purpose, it
   * validates states on different layers, while in the end only the outcome
   * in content-editable is relevant.
   */
  it("Should render image blob after loading from data", async () => {
    const { currentTestName } = expect.getState();
    const name = currentTestName ?? "Unknown Test";
    const { editor, mockContent } = application;
    const { ui } = editor;
    const editableHandle = await ui.getEditableElement();

    const id = 42;
    await mockContent.addContents({
      id,
      blob: PNG_RED_240x135,
      name: `Document for test ${name}`,
    });

    const data = richtext(
      p(
        img({
          alt: name,
          "xlink:href": blobReference(id),
        })
      )
    );

    const dataView = await editor.setDataAndGetDataView(data);

    /*
     * -----------------------------------------------------------------------
     * Validating state in data view (data, which just passed data processor).
     * -----------------------------------------------------------------------
     */

    // Image Tag should exist.
    expect(dataView).toContain(`<img`);
    // Alt Text should be available in data view
    expect(dataView).toContain(`alt="${currentTestName}"`);
    // Some generic image should have been applied, until updated from server.
    expect(dataView).toContain(`src="data:image/png;base64`);
    // Data View should still contain a reference to "xlink:href" for
    // subsequent retrieval of Blob from Studio Server.
    expect(dataView).toContain(`data-xlink-href="content/42#properties.data"`);

    /*
     * --------------------------------------------------------------------------
     * Validating state in editing view (data, which just passed data processor).
     * --------------------------------------------------------------------------
     */

    await expect(editableHandle).toHaveSelector("img");

    const imgHandle = await editableHandle.$("img");
    // The property reference should have been resolved to some
    // BLOB-link to render the image.
    await expect(imgHandle).toMatchAttribute("src", PNG_RED_240x135);
  });

  it("Should correctly set Image Alignment", async () => {
    const { currentTestName } = expect.getState();
    const name = currentTestName ?? "Unknown Test";
    const { editor, mockContent } = application;
    const { ui } = editor;

    const id = 42;
    await mockContent.addContents({
      id,
      blob: PNG_RED_240x135,
      name: `Document for test ${name}`,
    });

    const data = richtext(
      p(
        img({
          alt: name,
          "xlink:href": blobReference(id),
        })
      )
    );

    await editor.setDataAndGetDataView(data);
    const editableHandle = await ui.getEditableElement();

    // click on image
    await page.locator(".ck-editor__editable img").click();

    // click on the align-left button in the imageStyle balloon
    await ImageStyleBalloonAction.clickAlignLeft(application);
    await expectFloat(editableHandle, "float--left", "left");

    // click on the align-right button in the imageStyle balloon
    await ImageStyleBalloonAction.clickAlignRight(application);

    await expect(editableHandle).toHaveSelector("span.image-inline");
    await expectFloat(editableHandle, "float--right", "right");

    // click on the withinText button in the imageStyle balloon
    await ImageStyleBalloonAction.clickAlignWithinText(application);
    await expectFloat(editableHandle, "float--none", "none");

    // click on the page default button in the imageStyle balloon
    await ImageStyleBalloonAction.clickAlignPageDefault(application);
    await expectNoFloat(editableHandle);
  });
});

async function expectNoFloat(editableHandle: ElementHandle<HTMLElement>): Promise<void> {
  await expect(editableHandle).toHaveSelector("span.image-inline");
  const imgHandle = await editableHandle.$("span.image-inline");
  await expect(imgHandle).not.toMatchAttribute("class", /float/);
}

async function expectFloat(
  editableHandle: ElementHandle<HTMLElement>,
  floatClass: string,
  computedStyle: string
): Promise<void> {
  await expect(editableHandle).toHaveSelector("span.image-inline");
  const imgHandle = await editableHandle.$("span.image-inline");
  await expect(imgHandle).toMatchAttribute("class", new RegExp(`.*${floatClass}.*`));
  await expect(imgHandle).toMatchComputedStyle("float", computedStyle);
}
