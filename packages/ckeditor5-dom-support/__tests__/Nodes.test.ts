import { USE_CASE_NAME } from "./Constants";
import { documentFromHtml, documentFromXml } from "../src/Documents";
import { extractNodeContents, lookupNamespaceURI, serializeToXmlString } from "../src/Nodes";
import { fragmentFromNodeContents } from "../src/DocumentFragments";

describe("Nodes", () => {
  describe("serializeToXmlString", () => {
    it(USE_CASE_NAME, () => {
      const document = documentFromHtml("<body/>");
      const xmlString = serializeToXmlString(document);
      expect(xmlString).toBeDefined();
    });

    // noinspection HtmlRequiredTitleElement,HtmlRequiredLangAttribute
    it.each`
      node                                                                   | expectedXml
      ${new DocumentFragment()}                                              | ${``}
      ${fragmentFromNodeContents(documentFromHtml(`<p>1</p><p>2</p>`).body)} | ${`<p xmlns="http://www.w3.org/1999/xhtml">1</p><p xmlns="http://www.w3.org/1999/xhtml">2</p>`}
      ${documentFromXml("<root/>")}                                          | ${`<root/>`}
      ${documentFromHtml("<body/>")}                                         | ${`<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body></body></html>`}
    `("[$#] Should transform $node to: $expectedXml", ({ node, expectedXml }: { node: Node; expectedXml: string }) => {
      const xmlString = serializeToXmlString(node);
      expect(xmlString).toStrictEqual(expectedXml);
    });
  });

  describe("extractNodeContents", () => {
    it(USE_CASE_NAME, () => {
      const xmlDocument = documentFromXml("<root><child/></root>");
      const { documentElement } = xmlDocument;

      const extracted = extractNodeContents(documentElement);

      expect(serializeToXmlString(xmlDocument)).toStrictEqual("<root/>");
      expect(serializeToXmlString(extracted)).toStrictEqual("<child/>");
    });

    it("should extract all child nodes to fragment recursively", () => {
      const xmlDocument = documentFromXml("<root><child>1</child><child>2</child></root>");
      const { documentElement } = xmlDocument;

      const extracted = extractNodeContents(documentElement);

      expect(serializeToXmlString(xmlDocument)).toStrictEqual("<root/>");
      expect(serializeToXmlString(extracted)).toStrictEqual("<child>1</child><child>2</child>");
    });

    it("should extract text node as fragment", () => {
      const xmlDocument = documentFromXml("<root>TEXT</root>");
      const { documentElement } = xmlDocument;

      const extracted = extractNodeContents(documentElement);

      expect(serializeToXmlString(xmlDocument)).toStrictEqual("<root/>");
      expect(serializeToXmlString(extracted)).toStrictEqual("TEXT");
    });

    it("should do nothing on empty node", () => {
      const xmlDocument = documentFromXml("<root/>");
      const { documentElement } = xmlDocument;

      const extracted = extractNodeContents(documentElement);

      expect(serializeToXmlString(xmlDocument)).toStrictEqual("<root/>");
      expect(serializeToXmlString(extracted)).toStrictEqual("");
    });
  });

  describe("lookupNamespaceURI", () => {
    const parser = new DOMParser();
    type Input = "document" | "documentElement" | "firstChild";

    const getNode = (doc: Document, input: Input): Node => {
      let result: Node | null;
      switch (input) {
        case "document":
          result = doc;
          break;
        case "documentElement":
          result = doc.documentElement;
          break;
        case "firstChild":
          result = doc.documentElement.firstChild;
      }
      if (!result) {
        throw new Error(`Unable to determine node for ${input}`);
      }
      return result;
    };

    const parse = (str: string, type: DOMParserSupportedType): Document => {
      const result = parser.parseFromString(str, type);
      // noinspection HttpUrlsUsage
      if (result.documentElement.namespaceURI === "http://www.mozilla.org/newlayout/xml/parsererror.xml") {
        throw new Error(`Failed parsing ${str} as ${type}: ${result.documentElement.outerHTML}`);
      }
      return result;
    };

    const parseAndGet = (str: string, type: DOMParserSupportedType, input: Input): Node =>
      getNode(parse(str, type), input);

    const html: DOMParserSupportedType = "text/html";
    const xml: DOMParserSupportedType = "text/xml";

    const d: Input = "document";
    const e: Input = "documentElement";
    const f: Input = "firstChild";

    const nsHtml = `http://www.w3.org/1999/xhtml`;
    const nsCustom1 = `https://e.org/c/1`;
    const nsCustom2 = `https://e.org/c/2`;

    describe.each`
      force
      ${true}
      ${false}
    `("[$#] Forced mode: $force", ({ force }: { force: boolean }) => {
      describe.each`
        input
        ${d}
        ${e}
        ${f}
      `(`[$#] For input node: $input (force: ${force})`, ({ input }: { input: Input }) => {
        it.each`
          toParse                                                                  | type    | prefix  | expected
          ${`<div/>`}                                                              | ${html} | ${null} | ${nsHtml}
          ${`<div/>`}                                                              | ${html} | ${"c"}  | ${null}
          ${`<root><child/></root>`}                                               | ${xml}  | ${null} | ${null}
          ${`<root><child/></root>`}                                               | ${xml}  | ${"c"}  | ${null}
          ${`<root xmlns="${nsCustom1}"><child/></root>`}                          | ${xml}  | ${null} | ${nsCustom1}
          ${`<root xmlns="${nsCustom1}"><child/></root>`}                          | ${xml}  | ${"c"}  | ${null}
          ${`<c:root xmlns:c="${nsCustom1}"><c:child/></c:root>`}                  | ${xml}  | ${null} | ${null}
          ${`<c:root xmlns:c="${nsCustom1}"><c:child/></c:root>`}                  | ${xml}  | ${"c"}  | ${nsCustom1}
          ${`<root xmlns="${nsCustom1}" xmlns:c="${nsCustom2}"><c:child/></root>`} | ${xml}  | ${null} | ${nsCustom1}
          ${`<root xmlns="${nsCustom1}" xmlns:c="${nsCustom2}"><c:child/></root>`} | ${xml}  | ${"c"}  | ${nsCustom2}
          ${`<root xmlns="${nsCustom1}"><c:child xmlns:c="${nsCustom2}"/></root>`} | ${xml}  | ${null} | ${nsCustom1}
          ${`<root xmlns="${nsCustom1}"><c:child xmlns:c="${nsCustom2}"/></root>`} | ${xml}  | ${"c"}  | ${input === f ? nsCustom2 : null}
          ${`<root xmlns="${nsCustom1}"><child xmlns="${nsCustom2}"/></root>`}     | ${xml}  | ${null} | ${input === f ? nsCustom2 : nsCustom1}
          ${`<root xmlns="${nsCustom1}"><child xmlns="${nsCustom2}"/></root>`}     | ${xml}  | ${"c"}  | ${null}
        `(
          `[$#] Parsing $toParse as $type and lookup for prefix $prefix at ${input} should result in: $expected (force: ${force})`,
          ({
            toParse,
            type,
            prefix,
            expected,
          }: {
            toParse: string;
            type: DOMParserSupportedType;
            prefix: string | null;
            expected: string | null;
          }) => {
            const node = parseAndGet(toParse, type, input);
            if (!node) {
              throw new Error("Failed parsing.");
            }
            const actual = lookupNamespaceURI(node, prefix, force);
            expect(actual).toStrictEqual(expected);
          },
        );
      });
    });
  });
});
