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
import { expect, test } from "./base";
import { editor } from "./locators/editor";
import { openStory } from "./storybook/mountStory";
import { setEditorDataAndGetDataView } from "./storybook/testApi";

type ContentElement = (content: string, attributes?: Record<string, string>) => string;

interface ListElement {
  name: string;
  fn: ContentElement;
}

const listElements: ListElement[] = [
  { name: "ol", fn: ol as ContentElement },
  { name: "ul", fn: ul as ContentElement },
];

/**
 * This test is a test for the CKEditor 5 Document List feature and reflects the current state.
 * It does not always fit our expectations, but it is currently implemented in CKEditor 5 like that.
 *
 * On an update of CKEditor 5 those tests might signalize changes in CKEditor 5 behavior.
 *
 * Migrated to run against the Storybook story `tests-documentlists--default`
 * (see `tests/storybook/stories/tests/DocumentLists.stories.ts`) instead of the
 * former example application.
 */
const storyId = "tests-documentlists--default";

test.describe("Document List Feature", () => {
  test.beforeEach(async ({ page }) => {
    await openStory(page, storyId);
  });

  for (const { name: listElement, fn: listElementFunction } of listElements) {
    test.describe(`${listElement}: List attributes`, () => {
      test(`${listElement} contains attributes`, async ({ page }) => {
        const editable = editor(page);

        const text = `Lorem Ipsum`;
        const data = richtext(
          listElementFunction(li(text), {
            "class": "anyclass",
            "dir": "ltr",
            "xml:lang": "de",
            "lang": "de",
          }),
        );
        const dataView = await setEditorDataAndGetDataView(page, data);

        // Validate Data-Processing
        expect(dataView).toContain(text);

        // Validate Editing Downcast
        const listElementEditable = editable.locator(listElement).first();
        await expect(listElementEditable.locator("li").first()).toBeAttached();
        await expect(listElementEditable).toHaveAttribute("class", "anyclass");
        await expect(listElementEditable).toHaveAttribute("dir", "ltr");
        await expect(listElementEditable).toHaveAttribute("lang", "de");
      });

      test(`${listElement}, li element contains attributes`, async ({ page }) => {
        const editable = editor(page);

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
        await setEditorDataAndGetDataView(page, data);
        const listElementEditable = editable.locator(listElement).first();
        const listItemElement = listElementEditable.locator("li").first();
        await expect(listItemElement).toBeAttached();
        await expect(listItemElement).toHaveAttribute("class", "anyclass");
        await expect(listItemElement).toHaveAttribute("dir", "ltr");
        await expect(listItemElement).toHaveAttribute("lang", "de");
      });

      test(`${listElement} and li element contain attributes`, async ({ page }) => {
        const editable = editor(page);

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
        await setEditorDataAndGetDataView(page, data);
        const listElementEditable = editable.locator(listElement).first();
        await expect(listElementEditable).toBeAttached();
        await expect(listElementEditable).toHaveAttribute("class", `${listElement}Class`);
        await expect(listElementEditable).toHaveAttribute("dir", "rtl");
        await expect(listElementEditable).toHaveAttribute("lang", "en");

        const listItemElement = listElementEditable.locator("li").first();
        await expect(listItemElement).toBeAttached();
        await expect(listItemElement).toHaveAttribute("class", "liclass");
        await expect(listItemElement).toHaveAttribute("dir", "ltr");
        await expect(listItemElement).toHaveAttribute("lang", "de");
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
    test.describe(`${listElement}: Nested Elements in list item (li) according to dtd`, () => {
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
      test("nested p: is removed by CKEditor", async ({ page }) => {
        const editable = editor(page);

        const text = `Lorem Ipsum`;
        const data = richtext(listElementFunction(li(p(text))));
        await setEditorDataAndGetDataView(page, data);

        const listElementEditable = editable.locator(listElement).first();
        const listItemElement = listElementEditable.locator("li").first();
        await expect(listItemElement.locator("p")).toHaveCount(0);
      });

      // If the paragraph contains any relevant information (such as class
      // attributes), it should not be removed.
      const keepAttributes = [
        { attributeKey: "class", attributeValue: "CLASS" },
        { attributeKey: "dir", attributeValue: "ltr" },
        { attributeKey: "lang", attributeValue: "en" },
      ];
      for (const { attributeKey, attributeValue } of keepAttributes) {
        test(`nested p: should keep if attribute is set: '${attributeKey}' (value '${attributeValue}', for example)`, async ({
          page,
        }) => {
          const editable = editor(page);

          const text = `Lorem Ipsum`;
          const data = richtext(listElementFunction(li(p(text, { [attributeKey]: attributeValue }))));
          await setEditorDataAndGetDataView(page, data);

          const listElementEditable = editable.locator(listElement).first();
          const listItemElement = listElementEditable.locator("li").first();
          await expect(listItemElement).toBeAttached();

          const actualNestedElement = listItemElement.locator("p").first();
          await expect(actualNestedElement).toBeAttached();
          await expect(actualNestedElement).toContainText(text);
          await expect(actualNestedElement).toHaveAttribute(attributeKey, attributeValue);
        });
      }

      for (const { name: nestedListElement, fn: nestedListElementFunction } of listElements) {
        test(`nested ${nestedListElement}`, async ({ page }) => {
          const editable = editor(page);

          const text = `Lorem Ipsum`;
          const data = richtext(listElementFunction(li(nestedListElementFunction(li(text)))));
          await setEditorDataAndGetDataView(page, data);

          const listElementEditable = editable.locator(listElement).first();
          const listItemElement = listElementEditable.locator("li").first();
          await expect(listItemElement).toBeAttached();

          const nestedListElementEditable = listItemElement.locator(nestedListElement).first();
          await expect(nestedListElementEditable).toBeAttached();

          const nestedListItem = nestedListElementEditable.locator("li").first();
          await expect(nestedListItem).toBeAttached();
          await expect(nestedListItem).toContainText(text);
        });
      }

      const nestedElements: { name: string; fn: ContentElement }[] = [
        { name: "pre", fn: pre as ContentElement },
        { name: "blockquote", fn: blockquote as ContentElement },
        { name: "span", fn: span as ContentElement },
        { name: "strong", fn: strong as ContentElement },
        { name: "sub", fn: sub as ContentElement },
        { name: "sup", fn: sup as ContentElement },
        { name: "i", fn: em as ContentElement },
      ];
      for (const { name: nestedElement, fn: nestedElementFunction } of nestedElements) {
        test(`nested ${nestedElement}`, async ({ page }) => {
          const editable = editor(page);

          const text = `Lorem Ipsum`;
          const data = richtext(listElementFunction(li(nestedElementFunction(text))));
          await setEditorDataAndGetDataView(page, data);
          const listElementEditable = editable.locator(listElement).first();
          const listItemElement = listElementEditable.locator("li").first();
          await expect(listItemElement).toBeAttached();

          const actualNestedElement = listItemElement.locator(nestedElement).first();
          await expect(actualNestedElement).toBeAttached();
          await expect(actualNestedElement).toContainText(text);
        });
      }

      test("nested a", async ({ page }) => {
        const editable = editor(page);

        const text = `Lorem Ipsum`;
        const data = richtext(listElementFunction(li(a(text, { "xlink:href": "content:42" }))));
        await setEditorDataAndGetDataView(page, data);
        const listElementEditable = editable.locator(listElement).first();
        const listItemElement = listElementEditable.locator("li").first();
        await expect(listItemElement).toBeAttached();

        const actualNestedElement = listItemElement.locator("a").first();
        await expect(actualNestedElement).toBeAttached();
        await expect(actualNestedElement).toContainText(text);
      });

      test("nested img", async ({ page }) => {
        const editable = editor(page);

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
        await setEditorDataAndGetDataView(page, data);
        const listElementEditable = editable.locator(listElement).first();
        const listItemElement = listElementEditable.locator("li").first();
        await expect(listItemElement).toBeAttached();

        const actualNestedElement = listItemElement.locator("img").first();
        await expect(actualNestedElement).toBeAttached();
        await expect(actualNestedElement).toHaveAttribute("alt", text);
      });

      test("nested table", async ({ page }) => {
        const editable = editor(page);

        const text = `Lorem Ipsum`;
        const data = richtext(listElementFunction(li(table(tr(td(text))))));
        await setEditorDataAndGetDataView(page, data);
        const listElementEditable = editable.locator(listElement).first();
        const listItemElement = listElementEditable.locator("li").first();
        await expect(listItemElement).toBeAttached();

        await expect(listItemElement.locator("table").first()).toBeAttached();
        await expect(listItemElement.locator("tr").first()).toBeAttached();
        const tdElement = listItemElement.locator("td").first();
        await expect(tdElement).toBeAttached();
        await expect(tdElement).toContainText(text);
      });
    });
  }
});
