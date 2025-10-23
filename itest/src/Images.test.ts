import {
  a,
  blobReference,
  img,
  linkReference,
  p,
  richtext,
} from "@coremedia-internal/ckeditor5-coremedia-example-data";
import type { MockContentConfig } from "@coremedia/ckeditor5-coremedia-studio-integration-mock";
import type { ElementHandle } from "playwright-core";
import waitForExpect from "wait-for-expect";
import { ApplicationWrapper } from "./aut/ApplicationWrapper";
import type { ClassicEditorWrapper } from "./aut/ClassicEditorWrapper";
import type ContentLinkViewWrapper from "./aut/components/balloon/ContentLinkViewWrapper";
import ImageContextualBalloonToolbar from "./aut/components/balloon/ImageContextualBalloonToolbar";
import LinkActionsViewWrapper from "./aut/components/balloon/LinkActionsViewWrapper";
import ToolbarViewWrapper from "./aut/components/ToolbarViewWrapper";
import type { MockServiceAgentPluginWrapper } from "./aut/services/MockServiceAgentPluginWrapper";
import { PNG_EMPTY_24x24, PNG_LOCK_24x24, PNG_RED_240x135 } from "./MockFixtures";
import "./expect/Expectations";

describe("Image Features", () => {
  let application: ApplicationWrapper;

  beforeAll(async () => {
    application = await ApplicationWrapper.start();
    await application.goto();
    // Wait for CKEditor to be available prior to executing/continuing the tests.
    await expect(application).waitForCKEditorToBeAvailable();
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

  describe("Media Representation", () => {
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

    it.each`
      content                    | expectedImage
      ${normalFastImageContent}  | ${PNG_RED_240x135}
      ${slowLoadingImageContent} | ${PNG_RED_240x135}
      ${unreadableImageContent}  | ${PNG_LOCK_24x24}
      ${noDataImageContent}      | ${PNG_EMPTY_24x24}
    `("[$#] Should show the expected image for content $content.name", async ({ content, expectedImage }) => {
      const { editor, mockContent } = application;
      const { ui } = editor;
      const editableHandle = await ui.getEditableElement();

      await mockContent.addContents(content);
      const data = richtext(
        p(
          img({
            "alt": content.name,
            "xlink:href": blobReference(content.id),
          }),
        ),
      );

      const dataView = await editor.setDataAndGetDataView(data);

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

      await expect(editableHandle).toHaveSelector("img");

      const imgHandle = await editableHandle.$("img");
      // The property reference should have been resolved to the given expectedImage
      await waitForExpect(() => expect(imgHandle).toMatchAttribute("src", expectedImage));
    });
  });

  describe("Image with invalid xlink:href", () => {
    it("Should correctly render broken image with empty src", async () => {
      const { currentTestName } = expect.getState();
      const name = currentTestName ?? "Unknown Test";
      const { editor } = application;
      const { ui } = editor;

      const data = richtext(
        p(
          img({
            "alt": name,
            "xlink:href": "",
          }),
        ),
      );

      await editor.setDataAndGetDataView(data);
      const editableHandle = await ui.getEditableElement();

      await expect(editableHandle).toHaveSelector("img");

      const imgHandleWithAltAttribute = await editableHandle.$("img[alt]");
      // There is an image with an alt attribute
      await waitForExpect(() => expect(imgHandleWithAltAttribute).not.toBeNull());

      const imgHandleWithSrcAttribute = await editableHandle.$("img[src]");
      // There is no image with a src attribute
      await waitForExpect(() => expect(imgHandleWithSrcAttribute).toBeNull());
    });
  });

  describe("Image Alignment", () => {
    it("Should correctly set Image Alignment", async () => {
      const { currentTestName } = expect.getState();
      const name = currentTestName ?? "Unknown Test";
      const { editor, mockContent } = application;
      const { ui } = editor;

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

      await editor.setDataAndGetDataView(data);
      const editableHandle = await ui.getEditableElement();
      // click on image
      await page.locator(".ck-editor__editable img").click();
      const imageContextToolbar = getImageContextToolbar(editor);

      await imageContextToolbar.getAlignLeftButton().click();
      await expectFloat(editableHandle, "float--left", "left");

      // click on the align-right button in the imageStyle balloon
      await imageContextToolbar.getAlignRightButton().click();
      await expect(editableHandle).toHaveSelector("span.image-inline");
      await expectFloat(editableHandle, "float--right", "right");

      // click on the withinText button in the imageStyle balloon
      await imageContextToolbar.getAlignWithinTextButton().click();
      await expectFloat(editableHandle, "float--none", "none");

      // click on the page default button in the imageStyle balloon
      await imageContextToolbar.getAlignPageDefaultButton().click();
      await expectNoFloat(editableHandle);
    });
  });

  describe("Open image in tab", () => {
    it("Should trigger open in tab for image from balloon", async () => {
      const { currentTestName } = expect.getState();
      const name = currentTestName ?? "Unknown Test";
      const { editor, mockContent } = application;
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
      const serviceAgent: MockServiceAgentPluginWrapper = await application.mockServiceAgent;

      await editor.setDataAndGetDataView(data);
      await page.locator(".ck-editor__editable img").click();
      const imageContextToolbar = getImageContextToolbar(editor);

      const openInTabButton = imageContextToolbar.getOpenInTabButton();
      await expect(openInTabButton).waitToBeEnabled();
      await openInTabButton.click();
      const mockContentFormService = await serviceAgent.getContentFormServiceWrapper();
      expect(await mockContentFormService.getLastOpenedEntities()).toEqual(["content/42"]);
    });

    it("Should not be able to trigger open in tab for image from balloon", async () => {
      const { currentTestName } = expect.getState();
      const name = currentTestName ?? "Unknown Test";
      const { editor, mockContent } = application;
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

      await editor.setDataAndGetDataView(data);
      await page.locator(".ck-editor__editable img").click();
      const openInTabButton = getImageContextToolbar(editor).getOpenInTabButton();
      await expect(openInTabButton).waitToBeVisible();
      await expect(openInTabButton).not.waitToBeEnabled();
    });
  });

  describe("Image Links", () => {
    it("Should have no link and the link button in the contextual balloon is not pressed", async () => {
      const { currentTestName } = expect.getState();
      const name = currentTestName ?? "Unknown Test";
      const { editor, mockContent } = application;

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

      await editor.setDataAndGetDataView(data);
      await page.locator(".ck-editor__editable img").click();
      const imageContextToolbar = getImageContextToolbar(editor);
      const linkButton = imageContextToolbar.getLinkButton();
      await expect(linkButton).not.waitToBeOn();
    });

    it("Should have a link, contextual balloon link button is pressed and the balloon switches on click to show the link", async () => {
      const { currentTestName } = expect.getState();
      const name = currentTestName ?? "Unknown Test";
      const { editor, mockContent } = application;

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

      await editor.setDataAndGetDataView(data);
      await page.locator(".ck-editor__editable img").click();
      const imageContextToolbar = getImageContextToolbar(editor);
      const linkButton = imageContextToolbar.getLinkButton();
      await expect(linkButton).waitToHaveAriaLabel("Link image");
      await expect(linkButton).waitToBeOn();
      await linkButton.click();
      const contentLinkView = getContentLinkView(editor);
      await waitForExpect(() => expect(contentLinkView).waitToHaveContentName(`Document: ${contentLinkDocumentName}`));
    });
  });
});

async function expectNoFloat(editableHandle: ElementHandle<HTMLElement>): Promise<void> {
  await expect(editableHandle).toHaveSelector("span.image-inline");
  const imgHandle = await editableHandle.$("span.image-inline");
  await expect(imgHandle).not.toMatchAttribute("class", /float/);
}

async function expectFloat(
  editableHandle: ElementHandle<HTMLElement>,
  floatClass: string,
  computedStyle: string,
): Promise<void> {
  await expect(editableHandle).toHaveSelector("span.image-inline");
  const imgHandle = await editableHandle.$("span.image-inline");
  await expect(imgHandle).toMatchAttribute("class", new RegExp(`.*${floatClass}.*`));
  await expect(imgHandle).toMatchComputedStyle("float", computedStyle);
}

function getContentLinkView(editor: ClassicEditorWrapper): ContentLinkViewWrapper {
  const visibleView = editor.contextualBalloonWrapper.view;
  const linkActionsViewWrapper = LinkActionsViewWrapper.fromView(visibleView);
  return linkActionsViewWrapper.getContentLinkView();
}

function getImageContextToolbar(editor: ClassicEditorWrapper) {
  const visibleView = editor.contextualBalloonWrapper.view;
  const toolbarViewWrapper = ToolbarViewWrapper.fromView(visibleView);
  return new ImageContextualBalloonToolbar(toolbarViewWrapper);
}
