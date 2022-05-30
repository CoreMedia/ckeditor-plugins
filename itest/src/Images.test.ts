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

    await editor.setData(data);

    await expect(editableHandle).toHaveSelector("img");

    const imgHandle = await editableHandle.$("img");
    // The property reference should have been resolved to some
    // BLOB-link to render the image.
    await expect(imgHandle).toMatchAttribute("src", PNG_RED_240x135);
  });
});
