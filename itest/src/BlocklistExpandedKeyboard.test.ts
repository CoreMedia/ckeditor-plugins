import "./expect/Expectations";
import { ApplicationWrapper } from "./aut/ApplicationWrapper";
import { MockServiceAgentPluginWrapper } from "./aut/services/MockServiceAgentPluginWrapper";
import { p, richtext } from "@coremedia-internal/ckeditor5-coremedia-example-data/src/RichTextBase";
import { ctrlOrMeta } from "./browser/UserAgent";
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
    it("Expanded selection does not show balloon but on keyboard shortcut shows all blocked words", async () => {
      const notBlocked = "Hello World!";
      const blockedWord = "thisisablockedword";
      const anotherBlockedWord = "anotherBlockedWord";
      const serviceAgent: MockServiceAgentPluginWrapper = application.mockServiceAgent;
      await serviceAgent.getBlocklistServiceWrapper().addWord(blockedWord);
      await serviceAgent.getBlocklistServiceWrapper().addWord(anotherBlockedWord);

      const data = richtext(
        `${p(notBlocked)}${p(blockedWord + "," + anotherBlockedWord)}${p(
          "This is an example text for test purposes.",
        )}`,
      );
      await application.editor.setData(data);

      const view = application.editor.ui.view;

      // Select the whole text
      await view.locator.locator(`p`, { hasText: notBlocked }).click();
      await page.keyboard.down(await ctrlOrMeta());
      await page.keyboard.press("a");

      // Make sure balloon and input are visible
      const blocklistActionsView = view.body.balloonPanel.blocklistActionsView;
      const { input } = blocklistActionsView;
      await expect(input).not.waitToBeVisible();

      await useOpenBlocklistShortcut();
      await expect(view.body.balloonPanel.blocklistActionsView).waitToBeVisible();
      const allBlockedWords = await blocklistActionsView.allBlockedWords;
      await expect(allBlockedWords.length).toBe(2);
      await expect(allBlockedWords).toContain(blockedWord.toLowerCase());
      await expect(allBlockedWords).toContain(anotherBlockedWord.toLowerCase());
    });
  });
});

const useOpenBlocklistShortcut = async () => {
  // Open Blocklist Balloon via Shortcut
  await page.keyboard.down(await ctrlOrMeta());
  await page.keyboard.down("Shift");
  await page.keyboard.press("b");
};
