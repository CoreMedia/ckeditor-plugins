import { DataNormalizer, DataNormalizerMixin, isDataNormalizer, Normalizer } from "../src/DataNormalizer";
import { toNormalizedData } from "../src/NormalizedData";

type FakeDataNormalizer = Record<keyof Pick<DataNormalizer, "addNormalizer" | "normalize" | "areEqual">, unknown>;
const fakeDataNormalizer: FakeDataNormalizer = {
  addNormalizer: false,
  normalize: "Lorem",
  areEqual: null,
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const noOperation: () => any = () => {
  // No Operation
};
/**
 * Just something, that looks like a data-differ.
 */
const someDataNormalizer: DataNormalizer = {
  addNormalizer: noOperation,
  normalize: noOperation,
  areEqual: noOperation,
};

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

// Just don't corrupt the table indentation too much.
const n = toNormalizedData;

describe("DataNormalizer", () => {
  describe("Without Normalization", () => {
    const differ = {...DataNormalizerMixin};

    test.each`
      value1     | value2     | equal
      ${"lorem"} | ${"lorem"} | ${true}
      ${"lorem"} | ${"ipsum"} | ${false}
      ${"ipsum"} | ${"lorem"} | ${false}
      ${""}      | ${""}      | ${true}
    `("[$#] Should '$value1' be equal to '$value2'? => $equal", async ({value1, value2, equal}) => {
      expect(await differ.areEqual(value1, value2)).toStrictEqual(equal);
    });
  });

  describe("Normalization Respects Order and Priority Of Normalization", () => {
    /**
     * Will have all normalizers at same priority.
     */
    const differOrderOriginal = {...DataNormalizerMixin};
    /**
     * Will have all normalizers at same priority but in reversed order to the
     * original.
     */
    const differOrderReversed = {...DataNormalizerMixin};
    /**
     * Will have all normalizers at different priorities.
     */
    const differPrioritizedOrderOriginal = {...DataNormalizerMixin};
    /**
     * Will have all normalizers at different priorities but with priorities
     * reversed compared to original.
     */
    const differPrioritizedOrderReversed = {...DataNormalizerMixin};

    beforeAll(() => {
      const normalizer: Normalizer[] = [
        (v) => v.replaceAll("&", "&amp;"),
        (v) => v.replaceAll("<", "&lt;"),
        (v) => v.replaceAll(">", "&gt;"),
      ];
      normalizer.forEach((n, index) => {
        differOrderOriginal.addNormalizer(n);
        differPrioritizedOrderOriginal.addNormalizer(n, index);
      });
      normalizer.reverse().forEach((n, index) => {
        differOrderReversed.addNormalizer(n);
        differPrioritizedOrderReversed.addNormalizer(n, index);
      });
    });

    test.each`
      input  | original      | reversed
      ${"&"} | ${n("&amp;")} | ${n("&amp;")}
      ${"<"} | ${n("&lt;")}  | ${n("&amp;lt;")}
      ${">"} | ${n("&gt;")}  | ${n("&amp;gt;")}
    `("[$#] Should respect the normalizer order when transforming `$input`.", async ({ input, original, reversed }) => {
      expect(await differOrderOriginal.normalize(input)).toStrictEqual(original);
      expect(await differOrderReversed.normalize(input)).toStrictEqual(reversed);
      expect(await differPrioritizedOrderOriginal.normalize(input)).toStrictEqual(original);
      expect(await differPrioritizedOrderReversed.normalize(input)).toStrictEqual(reversed);
    });
  });

  describe("With some XML Declaration Normalization", () => {
    const differ = {...DataNormalizerMixin};

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
    `("[$#] Should '$value1' be equal to '$value2'? => $equal ($comment)", async ({ value1, value2, equal }) => {
      expect(await differ.areEqual(value1, value2)).toStrictEqual(equal);
    });
  });

  describe("With some Namespace Declaration Normalization", () => {
    const differ = {...DataNormalizerMixin};

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
    `("[$#] Should '$value1' be different to '$value2'? => $equal ($comment)", async ({ value1, value2, equal }) => {
      expect(await differ.areEqual(value1, value2)).toStrictEqual(equal);
    });
  });

  describe("With combined XML and Namespace Declaration Normalization", () => {
    const differ = {...DataNormalizerMixin};

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
    `("[$#] Should '$value1' be equal to '$value2'? => $equal ($comment)", async ({ value1, value2, equal }) => {
      expect(await differ.areEqual(value1, value2)).toStrictEqual(equal);
    });

    // noinspection HtmlUnknownAttribute
    test.each`
      value1                                                              | value2                                                                                              | equal   | comment
      ${`<?xml version="1.0"?>\n<root/>`}                                 | ${`<?xml version="1.0"?><root/>`}                                                                   | ${true} | ${"ignoring declaration should ignore newlines"}
      ${`<?xml version="1.0" encoding="utf-8" standalone="yes"?><root/>`} | ${`<?xml version="1.0"?><root/>`}                                                                   | ${true} | ${"ignoring declaration should ignore different declarations"}
      ${`<root xmlns="https://example.org/default"><ex:child/></root>`}   | ${`<root xmlns="https://example.org/default" xmlns:ex="https://example.org/ex"><ex:child/></root>`} | ${true} | ${"different namespace declarations ignored"}
    `("[$#] Should normalized '$value1' be equal to '$value2'? => $equal ($comment)", async ({ value1, value2, equal }) => {
      const normalized1 = await differ.normalize(value1);
      expect(await differ.areEqual(normalized1, value2)).toStrictEqual(equal);
    });

    // noinspection HtmlUnknownAttribute
    test.each`
      value1                                                              | value2                                                                                              | equal   | comment
      ${`<?xml version="1.0"?>\n<root/>`}                                 | ${`<?xml version="1.0"?><root/>`}                                                                   | ${true} | ${"ignoring declaration should ignore newlines"}
      ${`<?xml version="1.0" encoding="utf-8" standalone="yes"?><root/>`} | ${`<?xml version="1.0"?><root/>`}                                                                   | ${true} | ${"ignoring declaration should ignore different declarations"}
      ${`<root xmlns="https://example.org/default"><ex:child/></root>`}   | ${`<root xmlns="https://example.org/default" xmlns:ex="https://example.org/ex"><ex:child/></root>`} | ${true} | ${"different namespace declarations ignored"}
    `(
      "[$#] Should normalized '$value1' be equal to normalized '$value2'? => $equal ($comment)",
      async ({ value1, value2, equal }) => {
        const normalized1 = await differ.normalize(value1);
        const normalized2 = await differ.normalize(value2);
        expect(await differ.areEqual(normalized1, normalized2)).toStrictEqual(equal);
      }
    );
  });

  describe("isDataNormalizer", () => {
    test.each`
      value              | expected
      ${undefined}       | ${false}
      ${null}            | ${false}
      ${{}}              | ${false}
      ${"lorem"}         | ${false}
      ${fakeDataNormalizer}  | ${false}
      ${DataNormalizerMixin} | ${true}
      ${someDataNormalizer}  | ${true}
    `("[$#] Should `$value` by identified as DataNormalizer? $expected", ({value, expected}) => {
      expect(isDataNormalizer(value)).toStrictEqual(expected);
    });
  });
});
