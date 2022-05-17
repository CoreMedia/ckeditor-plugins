import { ApplicationWrapper } from "./aut/ApplicationWrapper";

/**
 * Provides some first test mainly for demonstration purpose of the test API.
 */
describe("Hello Editor", () => {
  let application: ApplicationWrapper;

  const reload = async () => {
    await application.goto();
    // Wait for CKEditor to be available prior to executing/continuing the tests.
    await expect(application).toReferenceCKEditor();
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
    await expect(application.editor).toHaveDataEqualTo("");
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
    await expect(editor).toHaveDataEqualTo("");

    const handle = await ui.getEditableElement();
    await handle.type(currentTestName);

    await expect(editor).toHaveDataContaining(currentTestName);
  });
});
