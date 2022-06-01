import { ApplicationWrapper } from "./aut/ApplicationWrapper";
import { PNG_RED_240x135 } from "@coremedia/ckeditor5-coremedia-studio-integration-mock/content/MockFixtures";
import { img, p, richtext } from "./fixture/Richtext";
import "./expect/ElementHandleExpectations";

/**
 * Simulates a blob reference to some property named `data`.
 *
 * @param id - numeric id of the document the property is contained in
 */
const blobReference = (id: number) => `content/${id}#properties.data`;

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
    const { editor, mockContent } = application;
    const { ui } = editor;
    const editableHandle = await ui.getEditableElement();

    const id = 42;
    await mockContent.addContents({
      id,
      blob: PNG_RED_240x135,
      name: `Document for test ${currentTestName}`,
    });

    const data = richtext(
      p(
        img({
          alt: currentTestName,
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
});
