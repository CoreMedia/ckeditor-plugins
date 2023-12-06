import { MockServiceAgentPluginWrapper } from "./aut/services/MockServiceAgentPluginWrapper";
import { p, richtext } from "@coremedia-internal/ckeditor5-coremedia-example-data/src/RichTextBase";
import { ApplicationWrapper } from "./aut/ApplicationWrapper";
import { clickModifiers } from "./aria/KeyboardUtils";
import "./expect/Expectations";

describe("Blocklist", () => {
  let application: ApplicationWrapper;

  beforeAll(async () => {
    application = await ApplicationWrapper.start();
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

  describe("Blocklist", () => {
    it("Collapsed selection shows balloon", async () => {
      const blockedWord = "thisisablockedword";
      const serviceAgent: MockServiceAgentPluginWrapper = application.mockServiceAgent;
      await serviceAgent.getBlocklistServiceWrapper().addWord(blockedWord);

      const data = richtext(`${p("Hello World!")}${p(blockedWord)}${p("This is an example text for test purposes.")}`);
      await application.editor.setData(data);

      const view = application.editor.ui.view;
      const blockedWordMarker = view.locator.locator(`span[data-blocklist-word]`);
      await expect(blockedWordMarker).toHaveText(blockedWord);

      const modifiers = await clickModifiers();
      await blockedWordMarker.click({ modifiers });

      const { input, submitButton } = view.body.balloonPanel.blocklistActionsView;
      await expect(input).waitToBeVisible();
      await expect(await submitButton.locator.isDisabled()).toBeTruthy();
    });
  });
});
