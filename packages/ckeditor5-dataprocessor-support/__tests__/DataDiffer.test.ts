import { DataDiffer, DataDifferMixin, isDataDiffer, Normalizer } from "../src/DataDiffer";

type FakeDataDiffer = Record<keyof DataDiffer, unknown>;
const fakeDataDiffer: FakeDataDiffer = {
  addNormalizer: false,
  normalize: "Lorem",
  areEqual: null,
};
const someDataDiffer: DataDiffer = new DataDifferMixin();

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
      value1     | value2     | equal
      ${"lorem"} | ${"lorem"} | ${true}
      ${"lorem"} | ${"ipsum"} | ${false}
      ${"ipsum"} | ${"lorem"} | ${false}
      ${""}      | ${""}      | ${true}
    `("[$#] Should '$value1' be equal to '$value2'? => $equal", ({ value1, value2, equal }) => {
      expect(differ.areEqual(value1, value2)).toStrictEqual(equal);
    });
  });

  describe("With some XML Declaration Normalization", () => {
    const differ = new DataDifferMixin();

    beforeAll(() => {
      differ.addNormalizer(normalizeXmlDeclaration);
    });

    // noinspection HtmlUnknownAttribute
    test.each`
      value1                                                              | value2                            | equal    | comment
      ${``}                                                               | ${``}                             | ${true}  | ${"empty should be considered equal"}
      ${`<?xml version="1.0"?><root/>`}                                   | ${`<?xml version="1.0"?><root/>`} | ${true}  | ${"same with declaration considered equal"}
      ${`<?xml version="1.0"?>\n<root/>`}                                 | ${`<?xml version="1.0"?><root/>`} | ${true}  | ${"ignoring declaration should ignore newlines"}
      ${`<?xml version="1.0" encoding="utf-8" standalone="yes"?><root/>`} | ${`<?xml version="1.0"?><root/>`} | ${true}  | ${"ignoring declaration should ignore different declarations"}
      ${`<root/>`}                                                        | ${`<root/>`}                      | ${true}  | ${"no vs. existing namespace declarations ignored"}
      ${`<?xml version="1.0"?>\n<root><child/></root>`}                   | ${`<?xml version="1.0"?><root/>`} | ${false} | ${"ignoring declaration should ignore newlines"}
    `("[$#] Should '$value1' be equal to '$value2'? => $equal ($comment)", ({ value1, value2, equal }) => {
      expect(differ.areEqual(value1, value2)).toStrictEqual(equal);
    });
  });

  describe("With some Namespace Declaration Normalization", () => {
    const differ = new DataDifferMixin();

    beforeAll(() => {
      differ.addNormalizer(normalizeNamespaceDeclarations);
    });

    // noinspection HtmlUnknownAttribute
    test.each`
      value1                                                                                              | value2                                                                                              | equal    | comment
      ${``}                                                                                               | ${``}                                                                                               | ${true}  | ${"empty should be considered equal"}
      ${`<root xmlns="https://example.org/default" xmlns:ex="https://example.org/ex"><ex:child/></root>`} | ${`<root xmlns="https://example.org/default" xmlns:ex="https://example.org/ex"><ex:child/></root>`} | ${true}  | ${"same with namespace declarations considered equal"}
      ${`<root xmlns="https://example.org/default"><ex:child/></root>`}                                   | ${`<root xmlns="https://example.org/default" xmlns:ex="https://example.org/ex"><ex:child/></root>`} | ${true}  | ${"different namespace declarations ignored"}
      ${`<root xmlns="https://example.org/v1"><ex:child/></root>`}                                        | ${`<root xmlns="https://example.org/v2" xmlns:ex="https://example.org/ex"><ex:child/></root>`}      | ${true}  | ${"different default namespace declarations ignored"}
      ${`<root><ex:child/></root>`}                                                                       | ${`<root xmlns="https://example.org/v2" xmlns:ex="https://example.org/ex"><ex:child/></root>`}      | ${true}  | ${"no vs. existing namespace declarations ignored"}
      ${`<root ex:attr="Lorem"><ex:child/></root>`}                                                       | ${`<root xmlns:ex="https://example.org/ex" ex:attr="Lorem"><ex:child/></root>`}                     | ${true}  | ${"no vs. existing namespace declarations ignored, respecting equal attribute"}
      ${`<root ex:attr="Lorem"><ex:child/></root>`}                                                       | ${`<root xmlns:ex="https://example.org/ex" ex:attr="Ipsum"><ex:child/></root>`}                     | ${false} | ${"no vs. existing namespace declarations ignored, respecting unequal attribute"}
    `("[$#] Should '$value1' be different to '$value2'? => $equal ($comment)", ({ value1, value2, equal }) => {
      expect(differ.areEqual(value1, value2)).toStrictEqual(equal);
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
      value1                                                              | value2                                                                                              | equal   | comment
      ${`<?xml version="1.0"?>\n<root/>`}                                 | ${`<?xml version="1.0"?><root/>`}                                                                   | ${true} | ${"ignoring declaration should ignore newlines"}
      ${`<?xml version="1.0" encoding="utf-8" standalone="yes"?><root/>`} | ${`<?xml version="1.0"?><root/>`}                                                                   | ${true} | ${"ignoring declaration should ignore different declarations"}
      ${`<root xmlns="https://example.org/default"><ex:child/></root>`}   | ${`<root xmlns="https://example.org/default" xmlns:ex="https://example.org/ex"><ex:child/></root>`} | ${true} | ${"different namespace declarations ignored"}
    `("[$#] Should '$value1' be equal to '$value2'? => $equal ($comment)", ({ value1, value2, equal }) => {
      expect(differ.areEqual(value1, value2)).toStrictEqual(equal);
    });

    // noinspection HtmlUnknownAttribute
    test.each`
      value1                                                              | value2                                                                                              | equal   | comment
      ${`<?xml version="1.0"?>\n<root/>`}                                 | ${`<?xml version="1.0"?><root/>`}                                                                   | ${true} | ${"ignoring declaration should ignore newlines"}
      ${`<?xml version="1.0" encoding="utf-8" standalone="yes"?><root/>`} | ${`<?xml version="1.0"?><root/>`}                                                                   | ${true} | ${"ignoring declaration should ignore different declarations"}
      ${`<root xmlns="https://example.org/default"><ex:child/></root>`}   | ${`<root xmlns="https://example.org/default" xmlns:ex="https://example.org/ex"><ex:child/></root>`} | ${true} | ${"different namespace declarations ignored"}
    `("[$#] Should normalized '$value1' be equal to '$value2'? => $equal ($comment)", ({ value1, value2, equal }) => {
      const normalized1 = differ.normalize(value1);
      expect(differ.areEqual(normalized1, value2)).toStrictEqual(equal);
    });

    // noinspection HtmlUnknownAttribute
    test.each`
      value1                                                              | value2                                                                                              | equal   | comment
      ${`<?xml version="1.0"?>\n<root/>`}                                 | ${`<?xml version="1.0"?><root/>`}                                                                   | ${true} | ${"ignoring declaration should ignore newlines"}
      ${`<?xml version="1.0" encoding="utf-8" standalone="yes"?><root/>`} | ${`<?xml version="1.0"?><root/>`}                                                                   | ${true} | ${"ignoring declaration should ignore different declarations"}
      ${`<root xmlns="https://example.org/default"><ex:child/></root>`}   | ${`<root xmlns="https://example.org/default" xmlns:ex="https://example.org/ex"><ex:child/></root>`} | ${true} | ${"different namespace declarations ignored"}
    `(
      "[$#] Should normalized '$value1' be equal to normalized '$value2'? => $equal ($comment)",
      ({ value1, value2, equal }) => {
        const normalized1 = differ.normalize(value1);
        const normalized2 = differ.normalize(value2);
        expect(differ.areEqual(normalized1, normalized2)).toStrictEqual(equal);
      }
    );
  });

  describe("isDataDiffer", () => {
    test.each`
      value             | expected
      ${undefined}      | ${false}
      ${null}           | ${false}
      ${{}}             | ${false}
      ${"lorem"}        | ${false}
      ${fakeDataDiffer} | ${false}
      ${someDataDiffer} | ${true}
    `("[$#] Should `$value` by identified as DataDiffer? $expected", ({ value, expected }) => {
      expect(isDataDiffer(value)).toStrictEqual(expected);
    });
  });
});
