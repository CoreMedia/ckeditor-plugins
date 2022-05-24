import { ApplicationWrapper } from "./aut/ApplicationWrapper";
import { a, p, richtext } from "./fixture/Richtext";
import "./expect/ElementHandleExpectations";
import { contentUriPath } from "@coremedia/ckeditor5-coremedia-studio-integration/content/UriPath";

/**
 * Provides some first test mainly for demonstration purpose of the test API.
 */
describe("Hello Editor", () => {
  let application: ApplicationWrapper;

  const reload = async () => {
    await application.goto();
    // Wait for CKEditor to be available prior to executing/continuing the tests.
    await expect(application).waitForCKEditorToBeAvailable();
  };

  beforeAll(async () => {
    application = await ApplicationWrapper.start();
    await reload();
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

  it("Should update data when cleared.", async () => {
    await application.editor.setData("");
    await expect(application.editor).waitForDataEqualTo("");
  });

  it("Should initially load with some welcome text rendered.", async () => {
    // We need to ensure not to collide with other tests, thus, resetting state.
    // This must be done, prior to retrieving any handles, as otherwise references
    // will be broken.
    await reload();

    const { editor } = application;
    const { ui } = editor;

    const handle = await ui.getEditableElement();
    await expect(handle.$("h1")).toHaveText("CoreMedia");
  });

  it("Should update data when typed.", async () => {
    const { editor } = application;
    const { ui } = editor;
    // Get some text to write.
    const { currentTestName } = expect.getState();

    await editor.setData("");
    // Wait for pre-condition to be fulfilled.
    await expect(editor).waitForDataEqualTo("");

    const handle = await ui.getEditableElement();
    await handle.type(currentTestName);

    await expect(editor).waitForDataContaining(currentTestName);
  });

  it("Should render external links.", async () => {
    const { currentTestName } = expect.getState();
    const { editor } = application;
    const { ui } = editor;
    const handle = await ui.getEditableElement();

    const linkTarget = "https://example.org";
    const data = richtext(p(a(currentTestName, { "xlink:href": linkTarget })));
    await editor.setData(data);

    // Match: We cannot fully match `<a href=...>`, as CKEditor may add classes
    // for display purpose to the UI. Nevertheless, this serves as example, how
    // we may test the rendered editing view.
    await expect(handle).waitForInnerHtmlToContain(` href="${linkTarget}">${currentTestName}</a>`);
  });

  it("Should render internal links.", async () => {
    const { currentTestName } = expect.getState();
    const { editor, mockContent } = application;
    const { ui } = editor;
    const handle = await ui.getEditableElement();
    const id = 42;
    await mockContent.addContents({
      id,
      name: `Document for test ${currentTestName}`,
    });

    const dataLink = contentUriPath(id);
    const data = richtext(p(a(currentTestName, { "xlink:href": dataLink })));
    await editor.setData(data);

    // Match: We cannot fully match `<a href=...>`, as CKEditor may add classes
    // for display purpose to the UI. Nevertheless, this serves as example, how
    // we may test the rendered editing view.
    //
    // `#`: For internal links, there is no representation in view. The reference
    // only exists on model layer.
    await expect(handle).waitForInnerHtmlToContain(` href="#">${currentTestName}</a>`);
  });
});
