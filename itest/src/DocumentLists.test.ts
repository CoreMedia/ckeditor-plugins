import { ApplicationWrapper } from "./aut/ApplicationWrapper";
import { li, ol, richtext, ul } from "@coremedia-internal/ckeditor5-coremedia-example-data/RichText";
import "./expect/Expectations";

/**
 * This test is a test for the CKEditor 5 Document List feature and reflects the current state.
 * It does not always fit our expectations, but it is currently implemented in CKEditor 5 like that.
 *
 * On an update of CKEditor 5 those tests might signalize changes in CKEditor 5 behavior.
 */
const olString = "ol";
const ulString = "ul";
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

  describe.each`
    listElement | listElementFunction
    ${olString} | ${ol}
    ${ulString} | ${ul}
  `(`$listElement: List attributes`, ({ listElement, listElementFunction }) => {
    it(`${listElement} contains attributes`, async () => {
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

    it(`${listElement}, li element contains attributes`, async () => {
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

    it(`${listElement} and li element contain attributes`, async () => {
      const { editor } = application;
      const { ui } = editor;
      const editableHandle = await ui.getEditableElement();

      const text = `Lorem Ipsum`;
      const data = richtext(
        listElementFunction(
          li(text, {
            "class": "liclass",
            "dir": "ltr",
            "xml:lang": "de",
            "lang": "de",
          }),
          {
            "class": `${listElement}Class`,
            "dir": "rtl",
            "xml:lang": "en",
            "lang": "en",
          }
        )
      );
      await editor.setDataAndGetDataView(data);
      const listElementEditable = editableHandle.$(`${listElement}`);
      expect(listElementEditable).not.toBeNull();
      await expect(listElementEditable).toMatchAttribute("class", `${listElement}Class`);
      await expect(listElementEditable).toMatchAttribute("dir", "rtl");
      await expect(listElementEditable).toMatchAttribute("lang", "en");

      const listItemElement = (await listElementEditable)?.$("li");
      expect(listItemElement).not.toBeNull();
      await expect(listItemElement).toMatchAttribute("class", "liclass");
      await expect(listItemElement).toMatchAttribute("dir", "ltr");
      await expect(listItemElement).toMatchAttribute("lang", "de");
    });
  });
});
