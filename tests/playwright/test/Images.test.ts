import { imageMediaCases, imagesScenario } from "@coremedia/ckeditor5-itest-constants";
import type { Locator, Page } from "playwright-core";
import { expect, test } from "./base";
import { editor } from "./locators/editor";
import { dataView, lastOpenedEntities } from "./locators/outputs";
import { openStory } from "./storybook/mountStory";

const storyId = (id: string): string => `tests-images--${id}`;

/**
 * Locates a button by its accessible name within the currently visible
 * contextual balloon (e.g., the image toolbar balloon).
 */
const balloonButton = (page: Page, name: string): Locator =>
  page.locator(".ck-balloon-panel_visible").getByRole("button", { name, exact: true });

/**
 * Validates, that the inline image has the given float class applied and that
 * the computed `float` style matches.
 */
const expectFloat = async (editable: Locator, floatClass: string, computedStyle: string): Promise<void> => {
  const inlineImage = editable.locator("span.image-inline");
  await expect(inlineImage).toBeVisible();
  await expect(inlineImage).toHaveClass(new RegExp(floatClass));
  await expect(inlineImage).toHaveCSS("float", computedStyle);
};

/**
 * Validates, that the inline image does not have any float class applied.
 */
const expectNoFloat = async (editable: Locator): Promise<void> => {
  const inlineImage = editable.locator("span.image-inline");
  await expect(inlineImage).toBeVisible();
  await expect(inlineImage).not.toHaveClass(/float/);
};

/**
 * Migrated to run against the fully prepared Storybook stories `tests-images--*`
 * (see `tests/storybook/stories/tests/Images.stories.ts`): each story bakes the
 * backing mock image content(s) and the image data, so the test only opens the
 * story and drives the editor through locators — no `page.evaluate`. The
 * "Media Representation" stories expose the processed `data-view` output and the
 * enabled "Open in tab" story exposes the `last-opened-entities` output. The
 * literals are shared via `@coremedia/ckeditor5-itest-constants`.
 */
test.describe("Image Features", () => {
  test.describe("Media Representation", () => {
    for (const testCase of imageMediaCases) {
      test(`Should show the expected image for content ${testCase.name}`, async ({ page }) => {
        await openStory(page, storyId(testCase.id));
        const editable = editor(page);

        /*
         * -----------------------------------------------------------------------
         * Validating state in data view (data, which just passed data processor).
         * -----------------------------------------------------------------------
         */

        // Image Tag should exist.
        await expect.poll(() => dataView(page)).toContain(`<img`);
        // Alt Text should be available in data view.
        await expect.poll(() => dataView(page)).toContain(`alt="${testCase.name}"`);
        // Some generic image should have been applied, until updated from server.
        await expect.poll(() => dataView(page)).toContain(`src="data:image/png;base64`);
        // Data View should still contain a reference to "xlink:href" for
        // subsequent retrieval of Blob from Studio Server.
        await expect
          .poll(() => dataView(page))
          .toContain(`data-xlink-href="content/${testCase.contentId}#properties.data"`);

        /*
         * --------------------------------------------------------------------------
         * Validating state in editing view (data, which just passed data processor).
         * --------------------------------------------------------------------------
         */

        // The property reference should have been resolved to the given expectedImage.
        await expect(editable.locator("img")).toHaveAttribute("src", testCase.expectedImage);
      });
    }
  });

  test.describe("Image with invalid xlink:href", () => {
    test("Should correctly render broken image with empty src", async ({ page }) => {
      await openStory(page, storyId(imagesScenario.invalidHref.id));
      const editable = editor(page);

      // There is an image with an alt attribute.
      await expect(editable.locator("img[alt]")).toBeAttached();
      // There is no image with a src attribute.
      await expect(editable.locator("img[src]")).toHaveCount(0);
    });
  });

  test.describe("Image Alignment", () => {
    test("Should correctly set Image Alignment", async ({ page }) => {
      await openStory(page, storyId(imagesScenario.alignment.id));
      const editable = editor(page);

      // click on image
      await page.locator(".ck-editor__editable img").click();

      await balloonButton(page, "Left-aligned").click();
      await expectFloat(editable, "float--left", "left");

      // click on the align-right button in the imageStyle balloon
      await balloonButton(page, "Right-aligned").click();
      await expectFloat(editable, "float--right", "right");

      // click on the withinText button in the imageStyle balloon
      await balloonButton(page, "Within Text").click();
      await expectFloat(editable, "float--none", "none");

      // click on the page default button in the imageStyle balloon
      await balloonButton(page, "Page default").click();
      await expectNoFloat(editable);
    });
  });

  test.describe("Open image in tab", () => {
    test("Should trigger open in tab for image from balloon", async ({ page }) => {
      await openStory(page, storyId(imagesScenario.openInTab.enabled.id));
      await page.locator(".ck-editor__editable img").click();

      const openInTabButton = balloonButton(page, "Open in tab");
      await expect(openInTabButton).toBeEnabled();
      await openInTabButton.click();
      await expect
        .poll(() => lastOpenedEntities(page))
        .toEqual(imagesScenario.openInTab.enabled.expectedOpenedEntities);
    });

    test("Should not be able to trigger open in tab for image from balloon", async ({ page }) => {
      await openStory(page, storyId(imagesScenario.openInTab.disabled.id));
      await page.locator(".ck-editor__editable img").click();
      const openInTabButton = balloonButton(page, "Open in tab");
      await expect(openInTabButton).toBeVisible();
      await expect(openInTabButton).toBeDisabled();
    });
  });

  test.describe("Image Links", () => {
    test("Should have no link and the link button in the contextual balloon is not pressed", async ({ page }) => {
      await openStory(page, storyId(imagesScenario.links.noLink.id));
      await page.locator(".ck-editor__editable img").click();
      const linkButton = balloonButton(page, "Link image");
      await expect(linkButton).not.toHaveClass(/ck-on/);
    });

    test("Should have a link, contextual balloon link button is pressed and the balloon switches on click to show the link", async ({
      page,
    }) => {
      await openStory(page, storyId(imagesScenario.links.withLink.id));
      await page.locator(".ck-editor__editable img").click();
      const linkButton = balloonButton(page, "Link image");
      await expect(linkButton).toHaveClass(/ck-on/);
      await linkButton.click();

      const contentLinkView = page.locator(".ck-balloon-panel_visible .cm-ck-content-link-view");
      await expect(contentLinkView).toHaveAccessibleName(
        `Document: ${imagesScenario.links.withLink.linkedContentName}`,
      );
    });
  });
});
