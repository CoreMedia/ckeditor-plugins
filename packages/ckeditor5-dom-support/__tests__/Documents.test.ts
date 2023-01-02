import { documentFromHtml, documentFromXml, isDocument } from "../src/Documents";
import { USE_CASE_NAME } from "./Constants";

describe("Documents", () => {
  describe("documentFromHtml", () => {
    it(USE_CASE_NAME, () => {
      const document = documentFromHtml(`<body><p/></body>`);
      expect(document).toBeDefined();
    });

    /**
     * Tests, that incomplete HTML can be parsed and is auto-completed.
     * While auto-completion is rather a feature of the underlying parser,
     * tests here also provide some hints, what you will get when using
     * this parsing method.
     */
    it.each`
      incompleteHtml
      ${`<head><title>Test</title></head>`}
      ${`<body/>`}
      ${`<body><p>Test</p></body>`}
    `(
      "should auto-complete missing root-elements for $incompleteHtml",
      ({ incompleteHtml }: { incompleteHtml: string }) => {
        const document = documentFromHtml(incompleteHtml);
        expect(document.documentElement.localName).toStrictEqual("html");
        expect(document.documentElement.firstElementChild?.localName).toStrictEqual("head");
        expect(document.documentElement.lastElementChild?.localName).toStrictEqual("body");
      }
    );
  });

  describe("documentFromXml", () => {
    it(USE_CASE_NAME, () => {
      const document = documentFromXml(`<root><child/></root>`);
      expect(document).toBeDefined();
    });

    it.each`
      xmlString                             | expectedRootElement | expectedFirstChildElement
      ${`<body/>`}                          | ${"body"}           | ${undefined}
      ${`<body><p>Test</p></body>`}         | ${"body"}           | ${"p"}
      ${`<root><child>Test</child></root>`} | ${"root"}           | ${"child"}
    `(
      "should successfully parse: $xmlString",
      ({
        xmlString,
        expectedRootElement,
        expectedFirstChildElement,
      }: {
        xmlString: string;
        expectedRootElement: string;
        expectedFirstChildElement: string | undefined;
      }) => {
        const document = documentFromXml(xmlString);
        expect(document.documentElement.localName).toStrictEqual(expectedRootElement);
        expect(document.documentElement.firstElementChild?.localName).toStrictEqual(expectedFirstChildElement);
      }
    );
  });

  describe("isDocument", () => {
    it(USE_CASE_NAME, () => {
      const node: Node = documentFromHtml(`<body><p/></body>`);
      if (isDocument(node)) {
        // We can now access `documentElement`.
        expect(node.documentElement).toBeDefined();
      }
    });

    it("should match Document nodes", () => {
      const document = documentFromHtml(`<body/>`);
      expect(isDocument(document)).toBeTruthy();
    });

    it.each`
      unmatched
      ${undefined}
      ${null}
      ${documentFromHtml("<body/>").firstElementChild}
    `("should not match any other objects than Document: $unmatched", ({ unmatched }: { unmatched: unknown }) => {
      expect(isDocument(unmatched)).toBeFalsy();
    });
  });
});
