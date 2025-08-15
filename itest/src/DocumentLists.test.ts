import {
  a,
  blockquote,
  em,
  img,
  li,
  ol,
  p,
  pre,
  richtext,
  span,
  strong,
  sub,
  sup,
  table,
  td,
  tr,
  ul,
  blobReference,
} from "@coremedia-internal/ckeditor5-coremedia-example-data";
import { ApplicationWrapper } from "./aut/ApplicationWrapper";
import "./expect/Expectations";

const olString = "ol";
const ulString = "ul";

/**
 * This test is a test for the CKEditor 5 Document List feature and reflects the current state.
 * It does not always fit our expectations, but it is currently implemented in CKEditor 5 like that.
 *
 * On an update of CKEditor 5 those tests might signalize changes in CKEditor 5 behavior.
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
        }),
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
          }),
        ),
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
          },
        ),
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

  /**
   * This is a test of nested elements inside a li-element according to the coremedia-richtext-1.0.dtd.
   *
   * Inside li elements "Flow" is allowed (@see coremedia-richtext-1.0.dtd#656).
   * Flow is defined as (#PCDATA | %block; | %inline;) (@see coremedia-richtext-1.0.dtd#608)
   * where block is p | ul | ol | pre | blockquote | table
   * and inline is a | em | strong | sub | sup | br | span | img
   * All those elements are allowed by the dtd.
   */
  describe.each`
    listElement | listElementFunction
    ${olString} | ${ol}
    ${ulString} | ${ul}
  `(`$listElement: Nested Elements in list item (li) according to dtd`, ({ listElement, listElementFunction }) => {
    // According to dtd p is allowed, but it will be removed by CKEditor.
    // While this should not trigger auto-checkout, for example, in CoreMedia Studio
    // it may be an issue, if your styling makes a difference here. Best practice
    // would either be CSS styling in delivery that incorporates both states
    // or extend the data-processing (toData) to always ensure texts are wrapped
    // in paragraphs.
    //
    // If we consider this an issue at least for paragraphs read from server,
    // possible workarounds may exist like adding a dummy class attribute value
    // when reading from server and removing it later on prior to writing it
    // to the server.
    it("nested p: is removed by CKEditor", async () => {
      const { editor } = application;
      const { ui } = editor;
      const editableHandle = await ui.getEditableElement();

      const text = `Lorem Ipsum`;
      const data = richtext(listElementFunction(li(p(text))));
      await editor.setDataAndGetDataView(data);

      const listElementEditable = editableHandle.$(`${listElement}`);
      const listItemElement = (await listElementEditable)?.$("li");
      const pTag = (await listItemElement)?.$("p");
      await expect(await pTag).toBeNull();
    });

    // If the paragraph contains any relevant information (such as class
    // attributes), it should not be removed.
    it.each`
      attributeKey | attributeValue
      ${"class"}   | ${"CLASS"}
      ${"dir"}     | ${"ltr"}
      ${"lang"}    | ${"en"}
    `(
      "nested p: should keep if attribute is set: '$attributeKey' (value '$attributeValue', for example)",
      async ({ attributeKey, attributeValue }) => {
        const { editor } = application;
        const { ui } = editor;
        const editableHandle = await ui.getEditableElement();

        const text = `Lorem Ipsum`;
        const data = richtext(listElementFunction(li(p(text, { [attributeKey]: attributeValue }))));
        await editor.setDataAndGetDataView(data);

        const listElementEditable = editableHandle.$(`${listElement}`);
        const listItemElement = (await listElementEditable)?.$("li");
        await expect(await listItemElement).not.toBeNull();

        const actualNestedElement = (await listItemElement)?.$("p");
        await expect(actualNestedElement).not.toBeNull();
        await expect(await actualNestedElement).toHaveText(text);

        await expect(actualNestedElement).toMatchAttribute(attributeKey, attributeValue);
      },
    );

    it.each`
      nestedListElement | nestedListElementFunction
      ${olString}       | ${ol}
      ${ulString}       | ${ul}
    `("nested $nestedListElement", async ({ nestedListElement, nestedListElementFunction }) => {
      const { editor } = application;
      const { ui } = editor;
      const editableHandle = await ui.getEditableElement();

      const text = `Lorem Ipsum`;
      const data = richtext(listElementFunction(li(nestedListElementFunction(li(text)))));
      await editor.setDataAndGetDataView(data);

      const listElementEditable = editableHandle.$(`${listElement}`);
      const listItemElement = (await listElementEditable)?.$("li");
      await expect(await listItemElement).not.toBeNull();

      const nestedListElementEditable = (await listItemElement)?.$(nestedListElement);
      await expect(await nestedListElementEditable).not.toBeNull();

      const nestedListItem = (await nestedListElementEditable)?.$("li");
      await expect(await nestedListItem).not.toBeNull();
      await expect(await nestedListItem).toHaveText(text);
    });

    it.each`
      nestedElement   | nestedElementFunction
      ${"pre"}        | ${pre}
      ${"blockquote"} | ${blockquote}
      ${"span"}       | ${span}
      ${"strong"}     | ${strong}
      ${"sub"}        | ${sub}
      ${"sup"}        | ${sup}
      ${"i"}          | ${em}
    `("nested $nestedElement", async ({ nestedElement, nestedElementFunction }) => {
      const { editor } = application;
      const { ui } = editor;
      const editableHandle = await ui.getEditableElement();

      const text = `Lorem Ipsum`;
      const data = richtext(listElementFunction(li(nestedElementFunction(text))));
      await editor.setDataAndGetDataView(data);
      const listElementEditable = editableHandle.$(`${listElement}`);
      const listItemElement = (await listElementEditable)?.$("li");
      await expect(await listItemElement).not.toBeNull();

      const actualNestedElement = (await listItemElement)?.$(nestedElement);
      await expect(actualNestedElement).not.toBeNull();
      await expect(await actualNestedElement).toHaveText(text);
    });

    it("nested a", async () => {
      const { editor } = application;
      const { ui } = editor;
      const editableHandle = await ui.getEditableElement();

      const text = `Lorem Ipsum`;
      const data = richtext(listElementFunction(li(a(text, { "xlink:href": "content:42" }))));
      await editor.setDataAndGetDataView(data);
      const listElementEditable = editableHandle.$(`${listElement}`);
      const listItemElement = (await listElementEditable)?.$("li");
      await expect(await listItemElement).not.toBeNull();

      const actualNestedElement = (await listItemElement)?.$("a");
      await expect(await actualNestedElement).not.toBeNull();
      await expect(await actualNestedElement).toHaveText(text);
    });

    it("nested img", async () => {
      const { editor } = application;
      const { ui } = editor;
      const editableHandle = await ui.getEditableElement();

      const text = `Lorem Ipsum`;
      const data = richtext(
        listElementFunction(
          li(
            img({
              "alt": text,
              "xlink:href": blobReference(42),
            }),
          ),
        ),
      );
      await editor.setDataAndGetDataView(data);
      const listElementEditable = editableHandle.$(`${listElement}`);
      const listItemElement = (await listElementEditable)?.$("li");
      await expect(await listItemElement).not.toBeNull();

      const actualNestedElement = (await listItemElement)?.$("img");
      await expect(await actualNestedElement).not.toBeNull();
      await expect(await actualNestedElement).toMatchAttribute("alt", text);
    });

    it("nested table", async () => {
      const { editor } = application;
      const { ui } = editor;
      const editableHandle = await ui.getEditableElement();

      const text = `Lorem Ipsum`;
      const data = richtext(listElementFunction(li(table(tr(td(text))))));
      await editor.setDataAndGetDataView(data);
      const listElementEditable = editableHandle.$(`${listElement}`);
      const listItemElement = (await listElementEditable)?.$("li");
      await expect(await listItemElement).not.toBeNull();

      const actualNestedElement = (await listItemElement)?.$("table");
      await expect(await actualNestedElement).not.toBeNull();
      const trElement = (await listItemElement)?.$("tr");
      await expect(await trElement).not.toBeNull();
      const tdElement = (await listItemElement)?.$("td");
      await expect(await tdElement).not.toBeNull();
      await expect(await tdElement).toHaveText(text);
    });
  });
});
