import "./expect/Expectations";
/**
 * Tests the BBCode feature.
 *
 * BBCode is a well tested feature, so this test is more of a smoke test.
 */
import { ApplicationWrapper } from "./aut/ApplicationWrapper";

describe("BBCode Test", () => {
  let application: ApplicationWrapper;

  beforeAll(async () => {
    application = await ApplicationWrapper.start([{ key: "dataType", value: "bbcode" }]);
    await application.goto();
    expect(application).waitForCKEditorToBeAvailable();
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

  describe("BBCode", () => {
    it("Should show a bold word as strong-tag", async () => {
      const { editor } = application;
      const { ui } = editor;
      const { view } = ui;

      // Initialize editor
      const data = "[b]boldword[/b]";
      await editor.setData(data);
      const helloWorldText = view.locator.locator(`strong`, { hasText: "boldword" });
      await expect(helloWorldText).toHaveText("boldword");
    });
  });
});
