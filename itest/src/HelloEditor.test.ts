import { ApplicationWrapper } from "./aut/ApplicationWrapper";
import waitForExpect from "wait-for-expect";

/**
 * Provides some first test mainly for demonstration purpose of the test API.
 */
describe("Hello Editor", () => {
  let application: ApplicationWrapper;

  beforeAll(async () => {
    application = await ApplicationWrapper.start();
    await application.goto();
  });

  beforeEach(() => {
    application.console.open();
  });

  afterEach(() => {
    expect(application.console).toHaveNoErrorsOrWarnings();
    application.console.close();
  });

  it("Example Application should expose CKEditor as global `editor`", async () => {
    await expect(application).toReferenceCKEditor();
  });

  it("Should update data when cleared.", async () => {
    await application.editor.setData("");
    await waitForExpect(async () => expect(await application.editor.getData()).toBe(""));
  });

  afterAll(async () => {
    await application?.shutdown();
  });
});
