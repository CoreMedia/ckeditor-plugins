import "global-jsdom/register";
import test, { describe } from "node:test";
import expect from "expect";
import { USE_CASE_NAME } from "./Constants";
import { documentFromHtml, documentFromXml } from "../src/Documents";
import { extractNodeContents, lookupNamespaceURI, serializeToXmlString } from "../src/Nodes";
import { fragmentFromNodeContents } from "../src/DocumentFragments";

void describe("Nodes", () => {
  void describe("serializeToXmlString", () => {
    test(USE_CASE_NAME, () => {
      const document = documentFromHtml("<body/>");
      const xmlString = serializeToXmlString(document);
      expect(xmlString).toBeDefined();
    });

    // noinspection HtmlRequiredTitleElement,HtmlRequiredLangAttribute
    const nodes: { node: Node; expectedXml: string }[] = [
      { node: new DocumentFragment(), expectedXml: `` },
      {
        node: fragmentFromNodeContents(documentFromHtml(`<p>1</p><p>2</p>`).body),
        expectedXml: `<p xmlns="http://www.w3.org/1999/xhtml">1</p><p xmlns="http://www.w3.org/1999/xhtml">2</p>`,
      },
      { node: documentFromXml("<root/>"), expectedXml: `<root/>` },
      {
        node: documentFromHtml("<body/>"),
        expectedXml: `<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body></body></html>`,
      },
    ];

    for (const [i, { node, expectedXml }] of nodes.entries()) {
      void test(`[${i}] Should transform ${node instanceof Node ? node.nodeName : String(node)} to: ${expectedXml}`, () => {
        const xmlString = serializeToXmlString(node);
        expect(xmlString).toStrictEqual(expectedXml);
      });
    }
  });

  void describe("extractNodeContents", () => {
    test(USE_CASE_NAME, () => {
      const xmlDocument = documentFromXml("<root><child/></root>");
      const { documentElement } = xmlDocument;

      const extracted = extractNodeContents(documentElement);

      expect(serializeToXmlString(xmlDocument)).toStrictEqual("<root/>");
      expect(serializeToXmlString(extracted)).toStrictEqual("<child/>");
    });

    void test("should extract all child nodes to fragment recursively", () => {
      const xmlDocument = documentFromXml("<root><child>1</child><child>2</child></root>");
      const { documentElement } = xmlDocument;

      const extracted = extractNodeContents(documentElement);

      expect(serializeToXmlString(xmlDocument)).toStrictEqual("<root/>");
      expect(serializeToXmlString(extracted)).toStrictEqual("<child>1</child><child>2</child>");
    });

    void test("should extract text node as fragment", () => {
      const xmlDocument = documentFromXml("<root>TEXT</root>");
      const { documentElement } = xmlDocument;

      const extracted = extractNodeContents(documentElement);

      expect(serializeToXmlString(xmlDocument)).toStrictEqual("<root/>");
      expect(serializeToXmlString(extracted)).toStrictEqual("TEXT");
    });

    void test("should do nothing on empty node", () => {
      const xmlDocument = documentFromXml("<root/>");
      const { documentElement } = xmlDocument;

      const extracted = extractNodeContents(documentElement);

      expect(serializeToXmlString(xmlDocument)).toStrictEqual("<root/>");
      expect(serializeToXmlString(extracted)).toStrictEqual("");
    });
  });

  void describe("lookupNamespaceURI", () => {
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

    const forces = [true, false];
    const inputs = [d, e, f];
    const testCases = [
      { toParse: `<div/>`, type: html, prefix: null, expected: () => nsHtml },
      { toParse: `<div/>`, type: html, prefix: "c", expected: () => null },
      { toParse: `<root><child/></root>`, type: xml, prefix: null, expected: () => null },
      { toParse: `<root><child/></root>`, type: xml, prefix: "c", expected: () => null },
      { toParse: `<root xmlns="${nsCustom1}"><child/></root>`, type: xml, prefix: null, expected: () => nsCustom1 },
      { toParse: `<root xmlns="${nsCustom1}"><child/></root>`, type: xml, prefix: "c", expected: () => null },
      { toParse: `<c:root xmlns:c="${nsCustom1}"><c:child/></c:root>`, type: xml, prefix: null, expected: () => null },
      {
        toParse: `<c:root xmlns:c="${nsCustom1}"><c:child/></c:root>`,
        type: xml,
        prefix: "c",
        expected: () => nsCustom1,
      },
      {
        toParse: `<root xmlns="${nsCustom1}" xmlns:c="${nsCustom2}"><c:child/></root>`,
        type: xml,
        prefix: null,
        expected: () => nsCustom1,
      },
      {
        toParse: `<root xmlns="${nsCustom1}" xmlns:c="${nsCustom2}"><c:child/></root>`,
        type: xml,
        prefix: "c",
        expected: () => nsCustom2,
      },
      {
        toParse: `<root xmlns="${nsCustom1}"><c:child xmlns:c="${nsCustom2}"/></root>`,
        type: xml,
        prefix: null,
        expected: () => nsCustom1,
      },
      // input-dependent case for prefix "c"
      {
        toParse: `<root xmlns="${nsCustom1}"><c:child xmlns:c="${nsCustom2}"/></root>`,
        type: xml,
        prefix: "c",
        expected: (input: Input) => (input === f ? nsCustom2 : null),
      },
      {
        toParse: `<root xmlns="${nsCustom1}"><child xmlns="${nsCustom2}"/></root>`,
        type: xml,
        prefix: null,
        expected: (input: Input) => (input === f ? nsCustom2 : nsCustom1),
      },
      {
        toParse: `<root xmlns="${nsCustom1}"><child xmlns="${nsCustom2}"/></root>`,
        type: xml,
        prefix: "c",
        expected: () => null,
      },
    ];

    for (const [forceIndex, force] of forces.entries()) {
      describe(`[${forceIndex}] Forced mode: ${force}`, () => {
        for (const [inputIndex, input] of inputs.entries()) {
          describe(`[${inputIndex}] For input node: ${input} (force: ${force})`, () => {
            for (const [caseIndex, testCase] of testCases.entries()) {
              void test(`[${caseIndex}] Parsing ${testCase.toParse} as ${testCase.type} and lookup for prefix ${
                testCase.prefix
              } at ${input} should result in: ${testCase.expected(input)} (force: ${force})`, () => {
                const node = parseAndGet(testCase.toParse, testCase.type, input);
                if (!node) {
                  throw new Error("Failed parsing.");
                }
                const actual = lookupNamespaceURI(node, testCase.prefix, force);
                expect(actual).toStrictEqual(testCase.expected(input));
              });
            }
          });
        }
      });
    }
  });
});
