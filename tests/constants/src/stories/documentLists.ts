/**
 * Case descriptors for the prepared `Tests/DocumentLists` stories
 * (`tests/storybook/stories/tests/DocumentLists.stories.ts`) and
 * `tests/playwright/test/DocumentLists.test.ts`.
 *
 * `DocumentLists.test.ts` is heavily parametrized (every list type × attribute
 * set / nested element). Sharing the case table here keeps the story (which
 * bakes the matching `data`) and the test (which opens the story by id and
 * asserts the editing view) perfectly in sync — no `page.evaluate` and no
 * hand-mirrored story ids.
 *
 * The richtext `data` itself is built in the story file from these descriptors
 * (it needs the example-data builders), so this shared package keeps no
 * dependency on the example-data package.
 *
 * Each case `id` is the kebab-cased Storybook story id suffix; the matching
 * story export name (PascalCase) resolves to `tests-documentlists--<id>`.
 */

/**
 * Supported document list element types.
 */
export type DocumentListType = "ol" | "ul";

/**
 * A single attribute key/value pair preserved on a nested paragraph.
 */
export interface DocumentListAttribute {
  key: string;
  value: string;
}

/**
 * Primitive fixtures shared by the document-list cases.
 */
export const documentListsConstants = {
  /**
   * List item text used throughout the cases.
   */
  text: "Lorem Ipsum",
  /**
   * List element types under test.
   */
  listTypes: ["ol", "ul"] as const satisfies readonly DocumentListType[],
  /**
   * Attribute set applied to the list (or li) in the single-owner attribute
   * cases. Editing-view assertions cover `class`/`dir`/`lang`.
   */
  attributeSet: { "class": "anyclass", "dir": "ltr", "xml:lang": "de", "lang": "de" },
  /**
   * Attribute set applied to the li in the "list and li contain attributes"
   * case.
   */
  bothLiAttributes: { "class": "liclass", "dir": "ltr", "xml:lang": "de", "lang": "de" },
  /**
   * Attribute set applied to the list in the "list and li contain attributes"
   * case (depends on the list element name).
   *
   * @param listType - list element the attributes are applied to
   */
  bothListAttributes: (listType: DocumentListType) => ({
    "class": `${listType}Class`,
    "dir": "rtl",
    "xml:lang": "en",
    "lang": "en",
  }),
  /**
   * Attributes that keep an otherwise-removed nested paragraph alive.
   */
  keepPAttributes: [
    { key: "class", value: "CLASS" },
    { key: "dir", value: "ltr" },
    { key: "lang", value: "en" },
  ] as const satisfies readonly DocumentListAttribute[],
  /**
   * Nested inline/block elements (editing-view tag names) allowed inside a list
   * item. `i` is the editing-view downcast of richtext `em`.
   */
  nestedTextElements: ["pre", "blockquote", "span", "strong", "sub", "sup", "i"] as const,
  /**
   * Content uri used for the nested anchor case.
   */
  nestedLinkHref: "content:42",
  /**
   * Mock content id whose blob backs the nested image case.
   */
  nestedImageId: 42,
} as const;

/**
 * Discriminated description of one document-list test case. `kind` drives both
 * the data the story bakes and the assertion the test performs.
 */
export type DocumentListsCase = { id: string; listType: DocumentListType } & (
  | { kind: "list-attributes" }
  | { kind: "li-attributes" }
  | { kind: "list-and-li-attributes" }
  | { kind: "nested-p-removed" }
  | { kind: "nested-p-keep"; attribute: DocumentListAttribute }
  | { kind: "nested-list"; nested: DocumentListType }
  | { kind: "nested-text-element"; element: string }
  | { kind: "nested-a" }
  | { kind: "nested-img" }
  | { kind: "nested-table" }
);

const buildCases = (): DocumentListsCase[] => {
  const cases: DocumentListsCase[] = [];
  for (const listType of documentListsConstants.listTypes) {
    cases.push({ id: `${listType}-contains-attributes`, listType, kind: "list-attributes" });
    cases.push({ id: `${listType}-li-contains-attributes`, listType, kind: "li-attributes" });
    cases.push({ id: `${listType}-and-li-contain-attributes`, listType, kind: "list-and-li-attributes" });
    cases.push({ id: `${listType}-nested-p-removed`, listType, kind: "nested-p-removed" });
    for (const attribute of documentListsConstants.keepPAttributes) {
      cases.push({ id: `${listType}-nested-p-keep-${attribute.key}`, listType, kind: "nested-p-keep", attribute });
    }
    for (const nested of documentListsConstants.listTypes) {
      cases.push({ id: `${listType}-nested-${nested}`, listType, kind: "nested-list", nested });
    }
    for (const element of documentListsConstants.nestedTextElements) {
      cases.push({ id: `${listType}-nested-${element}`, listType, kind: "nested-text-element", element });
    }
    cases.push({ id: `${listType}-nested-a`, listType, kind: "nested-a" });
    cases.push({ id: `${listType}-nested-img`, listType, kind: "nested-img" });
    cases.push({ id: `${listType}-nested-table`, listType, kind: "nested-table" });
  }
  return cases;
};

/**
 * All document-list cases, one prepared story per entry.
 */
export const documentListsCases: DocumentListsCase[] = buildCases();
