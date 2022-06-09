import { DataDifferMixin, Normalizer } from "../src/DataDiffer";

const xmlDeclarationRegExp = /^\s*<\?.*?\?>\s*/s;
/**
 * Remove XML declaration, if considered irrelevant for comparison.
 *
 * @param value - value to normalize
 */
const normalizeXmlDeclaration: Normalizer = (value: string): string => {
  return value.replace(xmlDeclarationRegExp, "");
};

const namespaceDeclarationRegExp = /(?<=<[^>]*)xmlns(?::\w+)?=['"][^'"]+['"]\s*(?=[^>]*>)/gs;
const elementRegExp = /(?<=<)[^>]+(?=>)/gs;

/**
 * Remove XML namespace declarations, if considered irrelevant for comparison.
 *
 * @param value - value to normalize
 */
const normalizeNamespaceDeclarations: Normalizer = (value: string): string => {
  return (
    value
      // First remove namespace declarations.
      .replaceAll(namespaceDeclarationRegExp, "")
      // Then we may have redundant spaces left: Remove.
      .replace(elementRegExp, (s) => s.trim())
  );
};

describe("DataDiffer", () => {
  describe("Without Normalization", () => {
    const differ = new DataDifferMixin();

    test.each`
      value1     | value2     | different
      ${"lorem"} | ${"lorem"} | ${false}
      ${"lorem"} | ${"ipsum"} | ${true}
      ${"ipsum"} | ${"lorem"} | ${true}
      ${""}      | ${""}      | ${false}
    `("[$#] Should '$value1' be different to '$value2'? => $different", ({ value1, value2, different }) => {
      expect(differ.areDifferent(value1, value2)).toStrictEqual(different);
    });
  });

  describe("With some XML Declaration Normalization", () => {
    const differ = new DataDifferMixin();

    beforeAll(() => {
      differ.addNormalizer(normalizeXmlDeclaration);
    });

    // noinspection HtmlUnknownAttribute
    test.each`
      value1                                                              | value2                            | different | comment
      ${``}                                                               | ${``}                             | ${false}  | ${"empty should be considered equal"}
      ${`<?xml version="1.0"?><root/>`}                                   | ${`<?xml version="1.0"?><root/>`} | ${false}  | ${"same with declaration considered equal"}
      ${`<?xml version="1.0"?>\n<root/>`}                                 | ${`<?xml version="1.0"?><root/>`} | ${false}  | ${"ignoring declaration should ignore newlines"}
      ${`<?xml version="1.0" encoding="utf-8" standalone="yes"?><root/>`} | ${`<?xml version="1.0"?><root/>`} | ${false}  | ${"ignoring declaration should ignore different declarations"}
      ${`<root/>`}                                                        | ${`<root/>`}                      | ${false}  | ${"no vs. existing namespace declarations ignored"}
      ${`<?xml version="1.0"?>\n<root><child/></root>`}                   | ${`<?xml version="1.0"?><root/>`} | ${true}   | ${"ignoring declaration should ignore newlines"}
    `("[$#] Should '$value1' be different to '$value2'? => $different ($comment)", ({ value1, value2, different }) => {
      expect(differ.areDifferent(value1, value2)).toStrictEqual(different);
    });
  });

  describe("With some Namespace Declaration Normalization", () => {
    const differ = new DataDifferMixin();

    beforeAll(() => {
      differ.addNormalizer(normalizeNamespaceDeclarations);
    });

    // noinspection HtmlUnknownAttribute
    test.each`
      value1                                                                                              | value2                                                                                              | different | comment
      ${``}                                                                                               | ${``}                                                                                               | ${false}  | ${"empty should be considered equal"}
      ${`<root xmlns="https://example.org/default" xmlns:ex="https://example.org/ex"><ex:child/></root>`} | ${`<root xmlns="https://example.org/default" xmlns:ex="https://example.org/ex"><ex:child/></root>`} | ${false}  | ${"same with namespace declarations considered equal"}
      ${`<root xmlns="https://example.org/default"><ex:child/></root>`}                                   | ${`<root xmlns="https://example.org/default" xmlns:ex="https://example.org/ex"><ex:child/></root>`} | ${false}  | ${"different namespace declarations ignored"}
      ${`<root xmlns="https://example.org/v1"><ex:child/></root>`}                                        | ${`<root xmlns="https://example.org/v2" xmlns:ex="https://example.org/ex"><ex:child/></root>`}      | ${false}  | ${"different default namespace declarations ignored"}
      ${`<root><ex:child/></root>`}                                                                       | ${`<root xmlns="https://example.org/v2" xmlns:ex="https://example.org/ex"><ex:child/></root>`}      | ${false}  | ${"no vs. existing namespace declarations ignored"}
      ${`<root ex:attr="Lorem"><ex:child/></root>`}                                                       | ${`<root xmlns:ex="https://example.org/ex" ex:attr="Lorem"><ex:child/></root>`}                     | ${false}  | ${"no vs. existing namespace declarations ignored, respecting equal attribute"}
      ${`<root ex:attr="Lorem"><ex:child/></root>`}                                                       | ${`<root xmlns:ex="https://example.org/ex" ex:attr="Ipsum"><ex:child/></root>`}                     | ${true}   | ${"no vs. existing namespace declarations ignored, respecting unequal attribute"}
    `("[$#] Should '$value1' be different to '$value2'? => $different ($comment)", ({ value1, value2, different }) => {
      expect(differ.areDifferent(value1, value2)).toStrictEqual(different);
    });
  });

  describe("With combined XML and Namespace Declaration Normalization", () => {
    const differ = new DataDifferMixin();

    beforeAll(() => {
      differ.addNormalizer(normalizeXmlDeclaration);
      differ.addNormalizer(normalizeNamespaceDeclarations);
    });

    // noinspection HtmlUnknownAttribute
    test.each`
      value1                                                              | value2                                                                                              | different | comment
      ${`<?xml version="1.0"?>\n<root/>`}                                 | ${`<?xml version="1.0"?><root/>`}                                                                   | ${false}  | ${"ignoring declaration should ignore newlines"}
      ${`<?xml version="1.0" encoding="utf-8" standalone="yes"?><root/>`} | ${`<?xml version="1.0"?><root/>`}                                                                   | ${false}  | ${"ignoring declaration should ignore different declarations"}
      ${`<root xmlns="https://example.org/default"><ex:child/></root>`}   | ${`<root xmlns="https://example.org/default" xmlns:ex="https://example.org/ex"><ex:child/></root>`} | ${false}  | ${"different namespace declarations ignored"}
    `("[$#] Should '$value1' be different to '$value2'? => $different ($comment)", ({ value1, value2, different }) => {
      expect(differ.areDifferent(value1, value2)).toStrictEqual(different);
    });
  });
});
