import { contentLinkContentName, contentLinkScenario } from "@coremedia/ckeditor5-itest-constants";
import { expect, test } from "./base";
import { editor } from "./locators/editor";
import { balloonPanel } from "./locators/balloon";
import { openStory } from "./storybook/mountStory";

/**
 * Runs against the fully prepared `Tests/ContentLink` stories
 * (see `tests/storybook/stories/tests/ContentLink.stories.ts`): each test opens
 * the story prepared for it (mock content + content-link data baked in) and
 * interacts/asserts through Playwright locators only — no `page.evaluate`.
 *
 * The editing view is accessed through the `editor(page)` locator (the former
 * `editorWrapper.ui.view`), and the detached balloon panel through the pure
 * locator-based `balloonPanel(page)` chain (the former
 * `editorWrapper.ui.view.body.balloonPanel`). The link texts are shared with the
 * stories via `@coremedia/ckeditor5-itest-constants` (`contentLinkScenario`).
 */
test.describe("Content Link Feature", () => {
  test.describe("ActionsView Extension", () => {
    test("Should render content-link with name", async ({ page }) => {
      await openStory(page, "tests-contentlink--render-with-name");
      const editable = editor(page);

      // In editing view links are represented with href="#".
      const contentLink = editable.getByText(contentLinkScenario.renderWithName.linkText);
      await contentLink.waitFor();
      await contentLink.click();

      const { linkToolbarView } = balloonPanel(page);

      // The balloon should pop up on click.
      await linkToolbarView.locator.waitFor();

      const { contentLinkView } = linkToolbarView;
      await contentLinkView.locator.waitFor();
      await expect(contentLinkView.locator.getByText("Document for")).toBeVisible();
    });

    test("Should be possible to reach all buttons with keyboard", async ({ page }) => {
      await openStory(page, "tests-contentlink--keyboard-buttons");
      const editable = editor(page);
      const contentName = contentLinkContentName(contentLinkScenario.keyboardButtons.linkText);

      // In editing view links are represented with href="#".
      const contentLink = editable.locator("a", { hasText: contentLinkScenario.keyboardButtons.linkText });
      await contentLink.click({ position: { x: 1, y: 1 } });

      const { linkToolbarView } = balloonPanel(page);
      await linkToolbarView.locator.waitFor();
      await page.keyboard.press("Tab");
      await expect(page.locator("*:focus")).toHaveAccessibleName(`Document: ${contentName}`);
      await page.keyboard.press("ArrowRight");
      await expect(page.locator("*:focus")).toHaveAccessibleName("Edit link");
      await page.keyboard.press("ArrowRight");
      await expect(page.locator("*:focus")).toHaveAccessibleName("Open in Current Tab");
      await page.keyboard.press("ArrowRight");
      await expect(page.locator("*:focus")).toHaveAccessibleName("Open in New Tab");
      await page.keyboard.press("ArrowRight");
      await expect(page.locator("*:focus")).toHaveAccessibleName("Show Embedded");
      await page.keyboard.press("ArrowRight");
      await expect(page.locator("*:focus")).toHaveAccessibleName("Open in Frame");
      await page.keyboard.press("ArrowRight");
      await expect(page.locator("*:focus")).toHaveAccessibleName("Unlink");
    });
  });

  test.describe("FormView Extension", () => {
    test("Should be not possible to save content link with empty url", async ({ page }) => {
      await openStory(page, "tests-contentlink--empty-url-form");
      const editable = editor(page);

      // In editing view links are represented with href="#".
      const contentLink = editable.locator("a", { hasText: contentLinkScenario.emptyUrlForm.linkText });
      await contentLink.click({ position: { x: 1, y: 1 } });

      const { linkToolbarView, linkFormView } = balloonPanel(page);

      await linkToolbarView.locator.waitFor();
      await linkToolbarView.edit();

      await linkFormView.locator.waitFor();
      const { contentLinkView } = linkFormView;

      await expect(contentLinkView.locator).toBeVisible();
      await contentLinkView.locator.getByText("Document for").waitFor();

      await contentLinkView.remove();

      // Content Link View should have been removed.
      await expect(contentLinkView.locator).toBeHidden();

      await expect(linkFormView.saveButtonLocator).toBeDisabled();
    });

    test("Should not be possible to save content link with empty url using keyboard", async ({ page }) => {
      await openStory(page, "tests-contentlink--empty-url-keyboard");
      const editable = editor(page);

      // In editing view links are represented with href="#".
      const contentLink = editable.getByText(contentLinkScenario.emptyUrlKeyboard.linkText);
      await contentLink.click({ position: { x: 1, y: 1 } });

      const { linkToolbarView, linkFormView } = balloonPanel(page);
      await linkToolbarView.locator.waitFor();
      await linkToolbarView.locator.getByLabel("Edit link").waitFor();

      await page.keyboard.press("Tab");
      await page.keyboard.press("ArrowRight");
      await page.keyboard.press("Enter");

      const { contentLinkView } = linkFormView;
      await contentLinkView.locator.getByText("Document for").waitFor();

      await page.keyboard.press("Tab");
      await page.keyboard.press("Space");

      await expect(linkFormView.saveButtonLocator).toBeDisabled();
    });
  });

  test("Should be possible to add content link with keyboard only", async ({ page }) => {
    await openStory(page, "tests-contentlink--add-with-keyboard");
    const editable = editor(page);
    const id = contentLinkScenario.addWithKeyboard.id;
    await editable.click();
    // `ControlOrMeta` resolves to Meta on macOS and Control elsewhere.
    await page.keyboard.press("ControlOrMeta+k");
    const { linkFormView } = balloonPanel(page);
    await linkFormView.locator.waitFor();
    await page.keyboard.type(`content:${id}`);

    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Enter");

    const contentLink = editable.locator("a");
    await expect(contentLink).toHaveText(`content:${id}`);
  });

  test("Should be possible to select content from suggestions.", async ({ page }) => {
    await openStory(page, "tests-contentlink--select-from-suggestions");
    const editable = editor(page);

    await editable.click();

    // `ControlOrMeta` resolves to Meta on macOS and Control elsewhere.
    await page.keyboard.press("ControlOrMeta+a");
    await page.keyboard.press("Delete");

    await page.keyboard.press("ControlOrMeta+k");

    const { linkFormView } = balloonPanel(page);
    await linkFormView.locator.waitFor();

    await linkFormView.locator.locator(".ck-dropdown").waitFor();
    await linkFormView.locator.locator(".ck-dropdown").locator("input.ck-input-text").waitFor();
    await linkFormView.locator.getByLabel("Document: Some Document").waitFor();

    await page.keyboard.type("101");

    await linkFormView.locator.getByLabel("Document: Document #1010").waitFor();
    await linkFormView.locator.getByLabel("Folder: Folder #1011").waitFor();

    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");

    await page.waitForTimeout(2000);

    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Enter");

    await page.getByRole("link", { name: "Some Folder" }).waitFor();
  });
});
