import { shadowDomScenario } from "@coremedia/ckeditor5-itest-constants";
import { expect, test } from "./base";
import { BalloonPanelViewWrapper } from "./wrappers/BalloonPanelViewWrapper";
import { fromLocator } from "./locators/Locatable";
import { editor } from "./locators/editor";
import { editorData } from "./locators/outputs";
import { overlayHost, shadowHost } from "./locators/storybook";
import { openStory } from "./storybook/mountStory";

/**
 * Runs against the fully prepared `Tests/ShadowDom` stories
 * (see `tests/storybook/stories/tests/ShadowDom.stories.ts`), which mount the
 * editor inside an open shadow root and render its floating UI into a separate
 * overlay container (`config.ui.overlayContainer`) at the end of the document
 * body.
 *
 * Playwright CSS and role locators pierce open shadow roots, so the tests
 * interact through locators only — no `page.evaluate`. Chaining from
 * `shadowHost(page)` or `overlayHost(page)` asserts in which tree an element
 * is rendered. The literals baked into the stories are shared via
 * `@coremedia/ckeditor5-itest-constants` (`shadowDomScenario`).
 */
test.describe("Shadow DOM", () => {
  test("Should render a styled editor inside the shadow root that reacts to typing.", async ({ page }) => {
    await openStory(page, "tests-shadowdom--typing");

    const editable = shadowHost(page).getByRole("textbox", { name: "Rich Text Editor" });
    await expect(editable).toBeVisible();
    // Adopted `ckeditor5.css`: the toolbar is a flex container.
    await expect(shadowHost(page).getByRole("toolbar", { name: "Editor toolbar" })).toHaveCSS("display", "flex");
    // Adopted `content-styles.css`: the editable has a minimum height.
    await expect(editable).toHaveCSS("min-height", "400px");

    await editable.click();
    await page.keyboard.type(shadowDomScenario.typedText);

    await expect(editable).toContainText(shadowDomScenario.typedText);
    await expect.poll(() => editorData(page)).toContain(shadowDomScenario.typedText);
  });

  test("Should apply a heading through the toolbar dropdown.", async ({ page }) => {
    await openStory(page, "tests-shadowdom--heading-dropdown");

    await editor(page).getByText(shadowDomScenario.paragraphText).click();

    const toolbar = shadowHost(page).getByRole("toolbar");
    await toolbar.getByRole("button", { name: "Heading" }).click();
    await shadowHost(page).getByRole("menuitemradio", { name: "Heading 1" }).click();

    await expect(editor(page).getByRole("heading", { level: 1, name: shadowDomScenario.paragraphText })).toBeVisible();
  });

  test("Should open the link balloon in the overlay container and keep it open on click into it.", async ({ page }) => {
    await openStory(page, "tests-shadowdom--content-link");

    await editor(page).getByRole("link", { name: shadowDomScenario.linkText }).click();

    const balloonPanel = BalloonPanelViewWrapper.fromParent(fromLocator(overlayHost(page)));
    const { linkToolbarView, linkFormView } = balloonPanel;
    await expect(linkToolbarView.locator).toBeVisible();

    const { contentLinkView } = linkToolbarView;
    await expect(contentLinkView.locator.getByText(`Document for ${shadowDomScenario.linkText}`)).toBeVisible();

    // A click into the balloon must not be treated as a click outside: the
    // button must survive the mousedown to switch the balloon to the form view.
    await linkToolbarView.locator.getByRole("button", { name: "Edit link" }).click();
    await expect(linkFormView.locator).toBeVisible();

    // A click outside of editor and balloon closes the balloon.
    await page.mouse.click(1, 1);
    await expect(linkFormView.locator).toBeHidden();
  });
});
