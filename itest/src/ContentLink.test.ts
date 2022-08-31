import "./expect/Expectations";
import { ApplicationWrapper } from "./aut/ApplicationWrapper";
import { contentUriPath } from "@coremedia/ckeditor5-coremedia-studio-integration/content/UriPath";
import { a, p, richtext } from "@coremedia-internal/ckeditor5-coremedia-example-data/RichTextBase";

describe("Content Link Feature", () => {
  // noinspection DuplicatedCode
  let application: ApplicationWrapper;

  beforeAll(async () => {
    application = await ApplicationWrapper.start();
    await application.goto();
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

  describe("ActionsView Extension", () => {
    it("Should render content-link with name", async () => {
      const name = "Lorem ipsum";
      const { editor, mockContent } = application;
      const { ui } = editor;
      const handle = await ui.getEditableElement();
      const id = 42;
      await mockContent.addContents({
        id,
        name: `Document for test ${name}`,
      });

      const dataLink = contentUriPath(id);
      const data = richtext(p(a(name, { "xlink:href": dataLink })));
      await editor.setData(data);

      await expect(handle).waitForInnerHtmlToContain(` href="#">${name}</a>`);

      await expect(handle).toHaveSelector(`a`);

      const anchorHandle = await handle.$(`a`);

      await anchorHandle?.click();

      const { linkActionsView } = editor.ui.view.body.balloonPanel;

      // The ballon should pop up on click.
      await expect(linkActionsView).waitToBeVisible();

      const { contentLinkView } = linkActionsView;

      await expect(contentLinkView).waitToBeVisible();
      await expect(contentLinkView.locator).toHaveText(`Document for`);
    });
  });
});
