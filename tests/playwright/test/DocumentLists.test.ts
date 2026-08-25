import type { Locator, Page } from "playwright-core";
import {
  documentListsCases,
  documentListsConstants,
  type DocumentListsCase,
} from "@coremedia/ckeditor5-itest-constants";
import { expect, test } from "./base";
import { editor } from "./locators/editor";
import { dataView } from "./locators/outputs";
import { openStory } from "./storybook/mountStory";

const { text } = documentListsConstants;

const storyId = (testCase: DocumentListsCase): string => `tests-documentlists--${testCase.id}`;

const firstListItem = (page: Page, testCase: DocumentListsCase): Locator =>
  editor(page).locator(testCase.listType).first().locator("li").first();

/**
 * This test is a test for the CKEditor 5 Document List feature and reflects the
 * current state. It does not always fit our expectations, but it is currently
 * implemented in CKEditor 5 like that. On an update of CKEditor 5 those tests
 * might signalize changes in CKEditor 5 behavior.
 *
 * Migrated to run against the fully prepared Storybook stories
 * `tests-documentlists--*` (see
 * `tests/storybook/stories/tests/DocumentLists.stories.ts`): each story bakes
 * the case's richtext data and exposes the processed `data-view` observable
 * output, so the test only opens the story and asserts through the `dataView`
 * locator and editing-view locators — no `page.evaluate`. The case table is
 * shared via `@coremedia/ckeditor5-itest-constants` (`documentListsCases`).
 *
 * Nested elements inside a list item (li) follow the coremedia-richtext-1.0.dtd:
 * inside li elements "Flow" is allowed (block: p | ul | ol | pre | blockquote |
 * table; inline: a | em | strong | sub | sup | br | span | img).
 */
test.describe("Document List Feature", () => {
  for (const testCase of documentListsCases) {
    test(`${testCase.listType} / ${testCase.kind} (${testCase.id})`, async ({ page }) => {
      await openStory(page, storyId(testCase));
      const editable = editor(page);
      const list = editable.locator(testCase.listType).first();

      switch (testCase.kind) {
        case "list-attributes": {
          // Validate Data-Processing
          await expect.poll(() => dataView(page)).toContain(text);
          // Validate Editing Downcast
          await expect(list.locator("li").first()).toBeAttached();
          await expect(list).toHaveAttribute("class", documentListsConstants.attributeSet.class);
          await expect(list).toHaveAttribute("dir", documentListsConstants.attributeSet.dir);
          await expect(list).toHaveAttribute("lang", documentListsConstants.attributeSet.lang);
          break;
        }
        case "li-attributes": {
          const listItem = list.locator("li").first();
          await expect(listItem).toBeAttached();
          await expect(listItem).toHaveAttribute("class", documentListsConstants.attributeSet.class);
          await expect(listItem).toHaveAttribute("dir", documentListsConstants.attributeSet.dir);
          await expect(listItem).toHaveAttribute("lang", documentListsConstants.attributeSet.lang);
          break;
        }
        case "list-and-li-attributes": {
          const listAttributes = documentListsConstants.bothListAttributes(testCase.listType);
          await expect(list).toBeAttached();
          await expect(list).toHaveAttribute("class", listAttributes.class);
          await expect(list).toHaveAttribute("dir", listAttributes.dir);
          await expect(list).toHaveAttribute("lang", listAttributes.lang);

          const listItem = list.locator("li").first();
          await expect(listItem).toBeAttached();
          await expect(listItem).toHaveAttribute("class", documentListsConstants.bothLiAttributes.class);
          await expect(listItem).toHaveAttribute("dir", documentListsConstants.bothLiAttributes.dir);
          await expect(listItem).toHaveAttribute("lang", documentListsConstants.bothLiAttributes.lang);
          break;
        }
        case "nested-p-removed": {
          // According to the dtd p is allowed, but it will be removed by CKEditor.
          await expect(firstListItem(page, testCase).locator("p")).toHaveCount(0);
          break;
        }
        case "nested-p-keep": {
          // If the paragraph carries relevant information it must not be removed.
          const listItem = firstListItem(page, testCase);
          await expect(listItem).toBeAttached();
          const nested = listItem.locator("p").first();
          await expect(nested).toBeAttached();
          await expect(nested).toContainText(text);
          await expect(nested).toHaveAttribute(testCase.attribute.key, testCase.attribute.value);
          break;
        }
        case "nested-list": {
          const listItem = firstListItem(page, testCase);
          await expect(listItem).toBeAttached();
          const nestedList = listItem.locator(testCase.nested).first();
          await expect(nestedList).toBeAttached();
          const nestedListItem = nestedList.locator("li").first();
          await expect(nestedListItem).toBeAttached();
          await expect(nestedListItem).toContainText(text);
          break;
        }
        case "nested-text-element": {
          const listItem = firstListItem(page, testCase);
          await expect(listItem).toBeAttached();
          const nested = listItem.locator(testCase.element).first();
          await expect(nested).toBeAttached();
          await expect(nested).toContainText(text);
          break;
        }
        case "nested-a": {
          const listItem = firstListItem(page, testCase);
          await expect(listItem).toBeAttached();
          const nested = listItem.locator("a").first();
          await expect(nested).toBeAttached();
          await expect(nested).toContainText(text);
          break;
        }
        case "nested-img": {
          const listItem = firstListItem(page, testCase);
          await expect(listItem).toBeAttached();
          const nested = listItem.locator("img").first();
          await expect(nested).toBeAttached();
          await expect(nested).toHaveAttribute("alt", text);
          break;
        }
        case "nested-table": {
          const listItem = firstListItem(page, testCase);
          await expect(listItem).toBeAttached();
          await expect(listItem.locator("table").first()).toBeAttached();
          await expect(listItem.locator("tr").first()).toBeAttached();
          const tdElement = listItem.locator("td").first();
          await expect(tdElement).toBeAttached();
          await expect(tdElement).toContainText(text);
          break;
        }
      }
    });
  }
});
