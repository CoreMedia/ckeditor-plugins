import { ApplicationWrapper } from "./aut/ApplicationWrapper";
import { li, ol, richtext, ul } from "@coremedia-internal/ckeditor5-coremedia-example-data/RichText";
import "./expect/Expectations";

/**
 *
 */
describe("Document List Feature", () => {
  // noinspection DuplicatedCode
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

  describe("List attributes", () => {
    //Unfortunately we have to import all parameters with ${} and the element name
    //is equal to the function name. Therefore, store the element name first as a string.
    const olString = "ol";
    const ulString = "ul";
    it.each`
      listElement | listElementFunction
      ${olString} | ${ol}
      ${ulString} | ${ul}
    `("$listElement contains attributes", async ({ listElement, listElementFunction }) => {
      const { editor } = application;
      const { ui } = editor;
      const editableHandle = await ui.getEditableElement();

      const text = `Lorem Ipsum`;
      const data = richtext(
        listElementFunction(li(text), {
          "class": "anyclass",
          "dir": "ltr",
          "xml:lang": "de",
          "lang": "de",
        })
      );
      const dataView = await editor.setDataAndGetDataView(data);

      // Validate Data-Processing
      expect(dataView).toContain(text);

      // Validate Editing Downcast
      const listElementEditable = editableHandle.$(`${listElement}`);
      const listItem = await (await listElementEditable)?.$("li");

      await expect(listItem).not.toBeNull();
      await expect(listElementEditable).toMatchAttribute("class", "anyclass");
      await expect(listElementEditable).toMatchAttribute("dir", "ltr");
      await expect(listElementEditable).toMatchAttribute("lang", "de");
    });

    it.each`
      listElement | listElementFunction
      ${olString} | ${ol}
      ${ulString} | ${ul}
    `("$listElement, li element contains attributes", async ({ listElement, listElementFunction }) => {
      const { editor } = application;
      const { ui } = editor;
      const editableHandle = await ui.getEditableElement();

      const text = `Lorem Ipsum`;
      const data = richtext(
        listElementFunction(
          li(text, {
            "class": "anyclass",
            "dir": "ltr",
            "xml:lang": "de",
            "lang": "de",
          })
        )
      );
      await editor.setDataAndGetDataView(data);
      const listElementEditable = editableHandle.$(`${listElement}`);
      const listItemElement = (await listElementEditable)?.$("li");
      expect(listItemElement).not.toBeNull();
      await expect(listItemElement).toMatchAttribute("class", "anyclass");
      await expect(listItemElement).toMatchAttribute("dir", "ltr");
      await expect(listItemElement).toMatchAttribute("lang", "de");
    });
  });
});
