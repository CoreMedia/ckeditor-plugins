import { SimpleDataDifferMixin, XmlDataDifferMixin, XmlDataDifferOptions } from "../src/DataDiffer";

describe("DataDiffer", () => {
  describe("SimpleDataDiffer", () => {
    const differ = new SimpleDataDifferMixin();

    test.each`
      value1     | value2     | options      | different
      ${"lorem"} | ${"lorem"} | ${undefined} | ${false}
      ${"lorem"} | ${"ipsum"} | ${undefined} | ${true}
      ${"ipsum"} | ${"lorem"} | ${undefined} | ${true}
      ${""}      | ${""}      | ${undefined} | ${false}
    `(
      "[$#] Having options $options, should '$value1' be different to '$value2'? => $different",
      ({ value1, value2, options, different }) => {
        expect(differ.areDifferent(value1, value2, options)).toStrictEqual(different);
      }
    );
  });

  describe("XmlDataDiffer", () => {
    const differ = new XmlDataDifferMixin();
    const withDeclaration: Required<Pick<XmlDataDifferOptions, "ignoreDeclaration">> = {
      ignoreDeclaration: false,
    };
    const withNamespaceDeclaration: Required<Pick<XmlDataDifferOptions, "ignoreNamespaceDeclarations">> = {
      ignoreNamespaceDeclarations: false,
    };

    // noinspection HtmlUnknownAttribute
    test.each`
      value1                                                                                              | value2                                                                                              | options                     | different | comment
      ${``}                                                                                               | ${``}                                                                                               | ${undefined}                | ${false}  | ${"empty should be considered equal"}
      ${`<?xml version="1.0"?><root/>`}                                                                   | ${`<?xml version="1.0"?><root/>`}                                                                   | ${undefined}                | ${false}  | ${"same with declaration considered equal"}
      ${`<?xml version="1.0"?><root/>`}                                                                   | ${`<?xml version="1.0"?><root/>`}                                                                   | ${withDeclaration}          | ${false}  | ${"same with declaration considered equal"}
      ${`<?xml version="1.0"?>\n<root/>`}                                                                 | ${`<?xml version="1.0"?><root/>`}                                                                   | ${undefined}                | ${false}  | ${"ignoring declaration should ignore newlines"}
      ${`<?xml version="1.0"?>\n<root/>`}                                                                 | ${`<?xml version="1.0"?><root/>`}                                                                   | ${withDeclaration}          | ${false}  | ${"design: not ignoring declaration still strips newlines"}
      ${`<?xml version="1.0" encoding="utf-8" standalone="yes"?><root/>`}                                 | ${`<?xml version="1.0"?><root/>`}                                                                   | ${undefined}                | ${false}  | ${"ignoring declaration should ignore different declarations"}
      ${`<root xmlns="https://example.org/default" xmlns:ex="https://example.org/ex"><ex:child/></root>`} | ${`<root xmlns="https://example.org/default" xmlns:ex="https://example.org/ex"><ex:child/></root>`} | ${undefined}                | ${false}  | ${"same with namespace declarations considered equal"}
      ${`<root xmlns="https://example.org/default" xmlns:ex="https://example.org/ex"><ex:child/></root>`} | ${`<root xmlns="https://example.org/default" xmlns:ex="https://example.org/ex"><ex:child/></root>`} | ${withNamespaceDeclaration} | ${false}  | ${"same with namespace declarations considered equal"}
      ${`<root xmlns="https://example.org/default"><ex:child/></root>`}                                   | ${`<root xmlns="https://example.org/default" xmlns:ex="https://example.org/ex"><ex:child/></root>`} | ${undefined}                | ${false}  | ${"different namespace declarations ignored"}
      ${`<root xmlns="https://example.org/default"><ex:child/></root>`}                                   | ${`<root xmlns="https://example.org/default" xmlns:ex="https://example.org/ex"><ex:child/></root>`} | ${withNamespaceDeclaration} | ${true}   | ${"aware of different namespace declarations"}
      ${`<root xmlns="https://example.org/v1"><ex:child/></root>`}                                        | ${`<root xmlns="https://example.org/v2" xmlns:ex="https://example.org/ex"><ex:child/></root>`}      | ${undefined}                | ${false}  | ${"different default namespace declarations ignored"}
      ${`<root xmlns="https://example.org/v1"><ex:child/></root>`}                                        | ${`<root xmlns="https://example.org/v2" xmlns:ex="https://example.org/ex"><ex:child/></root>`}      | ${withNamespaceDeclaration} | ${true}   | ${"different default namespace declarations not ignored"}
      ${`<root><ex:child/></root>`}                                                                       | ${`<root xmlns="https://example.org/v2" xmlns:ex="https://example.org/ex"><ex:child/></root>`}      | ${undefined}                | ${false}  | ${"no vs. existing namespace declarations ignored"}
      ${`<root><ex:child/></root>`}                                                                       | ${`<root xmlns="https://example.org/v2" xmlns:ex="https://example.org/ex"><ex:child/></root>`}      | ${withNamespaceDeclaration} | ${true}   | ${"no vs. existing namespace declarations not ignored"}
      ${`<root ex:attr="Lorem"><ex:child/></root>`}                                                       | ${`<root xmlns:ex="https://example.org/ex" ex:attr="Lorem"><ex:child/></root>`}                     | ${undefined}                | ${false}  | ${"no vs. existing namespace declarations ignored, respecting equal attribute"}
      ${`<root ex:attr="Lorem"><ex:child/></root>`}                                                       | ${`<root xmlns:ex="https://example.org/ex" ex:attr="Ipsum"><ex:child/></root>`}                     | ${undefined}                | ${true}   | ${"no vs. existing namespace declarations ignored, respecting unequal attribute"}
    `(
      "[$#] Having options $options, should '$value1' be different to '$value2'? => $different ($comment)",
      ({ value1, value2, options, different }) => {
        expect(differ.areDifferent(value1, value2, options)).toStrictEqual(different);
      }
    );
  });
});
