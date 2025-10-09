import "global-jsdom/register";
import test, { describe } from "node:test";
import expect from "expect";
import { documentFromHtml, documentFromXml, isDocument } from "../src/Documents";
import { USE_CASE_NAME } from "./Constants";

void describe("Documents", () => {
  void describe("documentFromHtml", () => {
    void void test(USE_CASE_NAME, () => {
      const document = documentFromHtml(`<body><p/></body>`);
      expect(document).toBeDefined();
    });

    /**
     * Tests, that incomplete HTML can be parsed and is auto-completed.
     * While auto-completion is rather a feature of the underlying parser,
     * tests here also provide some hints, what you will get when using
     * this parsing method.
     */
    const incompleteHtmlCases: { incompleteHtml: string }[] = [
      { incompleteHtml: `<head><title>Test</title></head>` },
      { incompleteHtml: `<body/>` },
      { incompleteHtml: `<body><p>Test</p></body>` },
    ];

    for (const [i, { incompleteHtml }] of incompleteHtmlCases.entries()) {
      void test(`[${i}] should auto-complete missing root-elements for ${incompleteHtml}`, () => {
        const document = documentFromHtml(incompleteHtml);
        expect(document.documentElement.localName).toStrictEqual("html");
        expect(document.documentElement.firstElementChild?.localName).toStrictEqual("head");
        expect(document.documentElement.lastElementChild?.localName).toStrictEqual("body");
      });
    }
  });

  void describe("documentFromXml", () => {
    void void test(USE_CASE_NAME, () => {
      const document = documentFromXml(`<root><child/></root>`);
      expect(document).toBeDefined();
    });

    const xmlCases: {
      xmlString: string;
      expectedRootElement: string;
      expectedFirstChildElement: string | undefined;
    }[] = [
      { xmlString: `<body/>`, expectedRootElement: "body", expectedFirstChildElement: undefined },
      { xmlString: `<body><p>Test</p></body>`, expectedRootElement: "body", expectedFirstChildElement: "p" },
      {
        xmlString: `<root><child>Test</child></root>`,
        expectedRootElement: "root",
        expectedFirstChildElement: "child",
      },
    ];

    for (const [i, { xmlString, expectedRootElement, expectedFirstChildElement }] of xmlCases.entries()) {
      void test(`[${i}] should successfully parse XML string`, () => {
        const document = documentFromXml(xmlString);
        expect(document.documentElement.localName).toStrictEqual(expectedRootElement);
        expect(document.documentElement.firstElementChild?.localName).toStrictEqual(expectedFirstChildElement);
      });
    }
  });

  void describe("isDocument", () => {
    void void test(USE_CASE_NAME, () => {
      const node: Node = documentFromHtml(`<body><p/></body>`);
      if (isDocument(node)) {
        // We can now access `documentElement`.
        expect(node.documentElement).toBeDefined();
      }
    });

    void test("should match Document nodes", () => {
      const document = documentFromHtml(`<body/>`);
      expect(isDocument(document)).toBeTruthy();
    });

    const unmatchedCases = [undefined, null, documentFromHtml("<body/>").firstElementChild];

    for (const [i, unmatched] of unmatchedCases.entries()) {
      void test(`[${i}] should not match any other objects than Document: ${unmatched}`, () => {
        expect(isDocument(unmatched)).toBeFalsy();
      });
    }
  });
});
