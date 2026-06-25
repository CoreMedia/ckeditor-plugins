import type { Meta, StoryObj } from "@storybook/html";
import {
  a,
  blobReference,
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
} from "@coremedia-internal/ckeditor5-coremedia-example-data";
import {
  documentListsCases,
  documentListsConstants,
  type DocumentListsCase,
  type DocumentListType,
} from "@coremedia/ckeditor5-itest-constants";
import { defaultScenarioArgs, mountScenario, type ScenarioArgs } from "../../src/runtime";
import { createEditorScenario } from "../../src/editors";

/**
 * Dedicated, fully prepared scenarios for `DocumentLists.test.ts`.
 *
 * The test is heavily parametrized, so a per-file factory generates one story
 * per case from the shared `documentListsCases` table
 * (`@coremedia/ckeditor5-itest-constants`): each story bakes the matching
 * richtext `data` and exposes the processed `data-view` observable output, so
 * the test only opens the story and asserts through the `dataView` locator and
 * editing-view locators — no `page.evaluate`.
 */
const meta: Meta<ScenarioArgs> = {
  title: "Tests/DocumentLists",
  args: {
    ...defaultScenarioArgs,
    dataType: "richtext",
  },
  render: (args) => mountScenario(createEditorScenario, args),
};

export default meta;

type Story = StoryObj<ScenarioArgs>;

type ContentElement = (content: string, attributes?: Record<string, string>) => string;

const { text } = documentListsConstants;

const listFn = (listType: DocumentListType): ContentElement => (listType === "ol" ? ol : ul) as ContentElement;

const nestedTextFn = (element: string): ContentElement => {
  switch (element) {
    case "pre":
      return pre as ContentElement;
    case "blockquote":
      return blockquote as ContentElement;
    case "span":
      return span as ContentElement;
    case "strong":
      return strong as ContentElement;
    case "sub":
      return sub as ContentElement;
    case "sup":
      return sup as ContentElement;
    case "i":
      return em as ContentElement;
    default:
      throw new Error(`Unsupported nested text element: ${element}`);
  }
};

const buildData = (testCase: DocumentListsCase): string => {
  const list = listFn(testCase.listType);
  switch (testCase.kind) {
    case "list-attributes":
      return richtext(list(li(text), { ...documentListsConstants.attributeSet }));
    case "li-attributes":
      return richtext(list(li(text, { ...documentListsConstants.attributeSet })));
    case "list-and-li-attributes":
      return richtext(
        list(li(text, { ...documentListsConstants.bothLiAttributes }), {
          ...documentListsConstants.bothListAttributes(testCase.listType),
        }),
      );
    case "nested-p-removed":
      return richtext(list(li(p(text))));
    case "nested-p-keep":
      return richtext(list(li(p(text, { [testCase.attribute.key]: testCase.attribute.value }))));
    case "nested-list":
      return richtext(list(li(listFn(testCase.nested)(li(text)))));
    case "nested-text-element":
      return richtext(list(li(nestedTextFn(testCase.element)(text))));
    case "nested-a":
      return richtext(list(li(a(text, { "xlink:href": documentListsConstants.nestedLinkHref }))));
    case "nested-img":
      return richtext(
        list(li(img({ "alt": text, "xlink:href": blobReference(documentListsConstants.nestedImageId) }))),
      );
    case "nested-table":
      return richtext(list(li(table(tr(td(text))))));
  }
};

const makeStory = (testCase: DocumentListsCase): Story => ({
  args: {
    data: buildData(testCase),
    outputs: ["data-view"],
  },
});

const casesById = new Map(documentListsCases.map((testCase) => [testCase.id, testCase]));

const story = (id: string): Story => {
  const testCase = casesById.get(id);
  if (!testCase) {
    throw new Error(`Unknown document-list case id: ${id}`);
  }
  return makeStory(testCase);
};

export const OlContainsAttributes: Story = story("ol-contains-attributes");
export const OlLiContainsAttributes: Story = story("ol-li-contains-attributes");
export const OlAndLiContainAttributes: Story = story("ol-and-li-contain-attributes");
export const OlNestedPRemoved: Story = story("ol-nested-p-removed");
export const OlNestedPKeepClass: Story = story("ol-nested-p-keep-class");
export const OlNestedPKeepDir: Story = story("ol-nested-p-keep-dir");
export const OlNestedPKeepLang: Story = story("ol-nested-p-keep-lang");
export const OlNestedOl: Story = story("ol-nested-ol");
export const OlNestedUl: Story = story("ol-nested-ul");
export const OlNestedPre: Story = story("ol-nested-pre");
export const OlNestedBlockquote: Story = story("ol-nested-blockquote");
export const OlNestedSpan: Story = story("ol-nested-span");
export const OlNestedStrong: Story = story("ol-nested-strong");
export const OlNestedSub: Story = story("ol-nested-sub");
export const OlNestedSup: Story = story("ol-nested-sup");
export const OlNestedI: Story = story("ol-nested-i");
export const OlNestedA: Story = story("ol-nested-a");
export const OlNestedImg: Story = story("ol-nested-img");
export const OlNestedTable: Story = story("ol-nested-table");

export const UlContainsAttributes: Story = story("ul-contains-attributes");
export const UlLiContainsAttributes: Story = story("ul-li-contains-attributes");
export const UlAndLiContainAttributes: Story = story("ul-and-li-contain-attributes");
export const UlNestedPRemoved: Story = story("ul-nested-p-removed");
export const UlNestedPKeepClass: Story = story("ul-nested-p-keep-class");
export const UlNestedPKeepDir: Story = story("ul-nested-p-keep-dir");
export const UlNestedPKeepLang: Story = story("ul-nested-p-keep-lang");
export const UlNestedOl: Story = story("ul-nested-ol");
export const UlNestedUl: Story = story("ul-nested-ul");
export const UlNestedPre: Story = story("ul-nested-pre");
export const UlNestedBlockquote: Story = story("ul-nested-blockquote");
export const UlNestedSpan: Story = story("ul-nested-span");
export const UlNestedStrong: Story = story("ul-nested-strong");
export const UlNestedSub: Story = story("ul-nested-sub");
export const UlNestedSup: Story = story("ul-nested-sup");
export const UlNestedI: Story = story("ul-nested-i");
export const UlNestedA: Story = story("ul-nested-a");
export const UlNestedImg: Story = story("ul-nested-img");
export const UlNestedTable: Story = story("ul-nested-table");
