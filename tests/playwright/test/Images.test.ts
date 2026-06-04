import {
  a,
  blobReference,
  img,
  linkReference,
  p,
  richtext,
} from "@coremedia-internal/ckeditor5-coremedia-example-data";
import type { MockContentConfig } from "@coremedia-internal/ckeditor5-coremedia-studio-integration-mock";
import type { Locator, Page } from "playwright-core";
import { expect, test } from "./base";
import { editor } from "./locators/editor";
import { applicationUrl } from "./utils/environment";
import { ApplicationWrapper } from "./wrappers/ApplicationWrapper";
import { PNG_EMPTY_24x24, PNG_LOCK_24x24, PNG_RED_240x135 } from "./MockFixtures";

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

test.describe("Image Features", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(applicationUrl);
    await editor(page).waitFor();
  });

  test.describe("Media Representation", () => {
    const normalFastImageContent: MockContentConfig = {
      id: 42,
      name: "Normal document with fast loading image",
      blob: PNG_RED_240x135,
    };

    const slowLoadingImageContent: MockContentConfig = {
      id: 42,
      name: "Normal document with slowly loading image",
      blob: PNG_RED_240x135,
      initialDelayMs: 2000,
    };

    const unreadableImageContent: MockContentConfig = {
      id: 42,
      name: "Document with unreadable image",
      blob: PNG_RED_240x135, //this one doesn't matter as it is unreadable
      readable: false,
    };

    const noDataImageContent: MockContentConfig = {
      id: 42,
      name: "Document with an empty image (no data available)",
      blob: undefined,
    };

    const cases: { content: MockContentConfig; expectedImage: string }[] = [
      { content: normalFastImageContent, expectedImage: PNG_RED_240x135 },
      { content: slowLoadingImageContent, expectedImage: PNG_RED_240x135 },
      { content: unreadableImageContent, expectedImage: PNG_LOCK_24x24 },
      { content: noDataImageContent, expectedImage: PNG_EMPTY_24x24 },
    ];

    for (const { content, expectedImage } of cases) {
      test(`Should show the expected image for content ${content.name}`, async ({ page }) => {
        const application = new ApplicationWrapper(page);
        const { editor: editorWrapper, mockContent } = application;
        const editable = editor(page);

        await mockContent.addContents(content);
        const data = richtext(
          p(
            img({
              "alt": content.name as string,
              "xlink:href": blobReference(content.id),
            }),
          ),
        );

        const dataView = await editorWrapper.setDataAndGetDataView(data);

        /*
         * -----------------------------------------------------------------------
         * Validating state in data view (data, which just passed data processor).
         * -----------------------------------------------------------------------
         */

        // Image Tag should exist.
        expect(dataView).toContain(`<img`);
        // Alt Text should be available in data view
        expect(dataView).toContain(`alt="${content.name}"`);
        // Some generic image should have been applied, until updated from server.
        expect(dataView).toContain(`src="data:image/png;base64`);
        // Data View should still contain a reference to "xlink:href" for
        // subsequent retrieval of Blob from Studio Server.
        expect(dataView).toContain(`data-xlink-href="content/${content.id}#properties.data"`);

        /*
         * --------------------------------------------------------------------------
         * Validating state in editing view (data, which just passed data processor).
         * --------------------------------------------------------------------------
         */

        // The property reference should have been resolved to the given expectedImage.
        await expect(editable.locator("img")).toHaveAttribute("src", expectedImage);
      });
    }
  });

  test.describe("Image with invalid xlink:href", () => {
    test("Should correctly render broken image with empty src", async ({ page }, testInfo) => {
      const name = testInfo.title;
      const application = new ApplicationWrapper(page);
      const { editor: editorWrapper } = application;
      const editable = editor(page);

      const data = richtext(
        p(
          img({
            "alt": name,
            "xlink:href": "",
          }),
        ),
      );

      await editorWrapper.setDataAndGetDataView(data);

      // There is an image with an alt attribute.
      await expect(editable.locator("img[alt]")).toBeAttached();
      // There is no image with a src attribute.
      await expect(editable.locator("img[src]")).toHaveCount(0);
    });
  });

  test.describe("Image Alignment", () => {
    test("Should correctly set Image Alignment", async ({ page }, testInfo) => {
      const name = testInfo.title;
      const application = new ApplicationWrapper(page);
      const { editor: editorWrapper, mockContent } = application;
      const editable = editor(page);

      const id = 42;
      await mockContent.addContents({
        id,
        blob: PNG_RED_240x135,
        name: `Document for test ${name}`,
      });

      const data = richtext(
        p(
          img({
            "alt": name,
            "xlink:href": blobReference(id),
          }),
        ),
      );

      await editorWrapper.setDataAndGetDataView(data);
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
    test("Should trigger open in tab for image from balloon", async ({ page }, testInfo) => {
      const name = testInfo.title;
      const application = new ApplicationWrapper(page);
      const { editor: editorWrapper, mockContent } = application;
      const id = 42;
      await mockContent.addContents({
        id,
        blob: PNG_RED_240x135,
        name: `Document for test ${name}`,
      });
      const data = richtext(
        p(
          img({
            "alt": name,
            "xlink:href": blobReference(id),
          }),
        ),
      );
      const serviceAgent = application.mockServiceAgent;

      await editorWrapper.setDataAndGetDataView(data);
      await page.locator(".ck-editor__editable img").click();

      const openInTabButton = balloonButton(page, "Open in tab");
      await expect(openInTabButton).toBeEnabled();
      await openInTabButton.click();
      const mockContentFormService = serviceAgent.getContentFormServiceWrapper();
      expect(await mockContentFormService.getLastOpenedEntities()).toEqual(["content/42"]);
    });

    test("Should not be able to trigger open in tab for image from balloon", async ({ page }, testInfo) => {
      const name = testInfo.title;
      const application = new ApplicationWrapper(page);
      const { editor: editorWrapper, mockContent } = application;
      const id = 42;
      await mockContent.addContents({
        id,
        blob: PNG_RED_240x135,
        name: `Document for test ${name}`,
        readable: false,
      });
      const data = richtext(
        p(
          img({
            "alt": name,
            "xlink:href": blobReference(id),
          }),
        ),
      );

      await editorWrapper.setDataAndGetDataView(data);
      await page.locator(".ck-editor__editable img").click();
      const openInTabButton = balloonButton(page, "Open in tab");
      await expect(openInTabButton).toBeVisible();
      await expect(openInTabButton).toBeDisabled();
    });
  });

  test.describe("Image Links", () => {
    test("Should have no link and the link button in the contextual balloon is not pressed", async ({
      page,
    }, testInfo) => {
      const name = testInfo.title;
      const application = new ApplicationWrapper(page);
      const { editor: editorWrapper, mockContent } = application;

      const imageId = 42;

      await mockContent.addContents({
        id: imageId,
        blob: PNG_RED_240x135,
        name: `Document for test ${name}`,
      });

      const data = richtext(
        p(
          img({
            "alt": name,
            "xlink:href": blobReference(imageId),
          }),
        ),
      );

      await editorWrapper.setDataAndGetDataView(data);
      await page.locator(".ck-editor__editable img").click();
      const linkButton = balloonButton(page, "Link image");
      await expect(linkButton).not.toHaveClass(/ck-on/);
    });

    test("Should have a link, contextual balloon link button is pressed and the balloon switches on click to show the link", async ({
      page,
    }, testInfo) => {
      const name = testInfo.title;
      const application = new ApplicationWrapper(page);
      const { editor: editorWrapper, mockContent } = application;

      const imageId = 42;
      const linkedContentId = 46;

      const contentLinkDocumentName = `Document to link to the image for test ${name}`;
      await mockContent.addContents(
        {
          id: imageId,
          blob: PNG_RED_240x135,
          name: `Document for test ${name}`,
        },
        {
          id: linkedContentId,
          name: contentLinkDocumentName,
        },
      );

      const data = richtext(
        p(
          a(
            img({
              "alt": name,
              "xlink:href": blobReference(imageId),
            }),
            { "xlink:href": linkReference(linkedContentId) },
          ),
        ),
      );

      await editorWrapper.setDataAndGetDataView(data);
      await page.locator(".ck-editor__editable img").click();
      const linkButton = balloonButton(page, "Link image");
      await expect(linkButton).toHaveClass(/ck-on/);
      await linkButton.click();

      const contentLinkView = page.locator(".ck-balloon-panel_visible .cm-ck-content-link-view");
      await expect(contentLinkView).toHaveAccessibleName(`Document: ${contentLinkDocumentName}`);
    });
  });
});
