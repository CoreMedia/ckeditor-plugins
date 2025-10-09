import "global-jsdom/register";
import test, { describe } from "node:test";
import expect from "expect";
import { USE_CASE_NAME } from "./Constants";
import { documentFromHtml, documentFromXml } from "../src/Documents";
import { ElementDefinition, isElement, removeClass, renameElement } from "../src/Elements";
import { serializeToXmlString } from "../src/Nodes";

describe("Elements", () => {
  describe("isElement", () => {
    test(USE_CASE_NAME, () => {
      const node: Node = documentFromHtml("<body/>").body;
      if (isElement(node)) {
        // We can now access `outerHTML`.
        expect(node.outerHTML).toBeDefined();
      }
    });

    const matchedCases = [documentFromHtml("<body/>").body, documentFromXml("<root><child/></root>").firstElementChild];

    for (const [i, matched] of matchedCases.entries()) {
      test(`[${i}] should match any Element: ${matched}`, () => {
        expect(isElement(matched)).toBeTruthy();
      });
    }

    const unmatchedCases = [undefined, null, documentFromHtml("<body/>")];

    for (const [i, unmatched] of unmatchedCases.entries()) {
      test(`[${i}] should not match any other objects than Elements: ${String(unmatched)}`, () => {
        expect(isElement(unmatched)).toBeFalsy();
      });
    }
  });

  describe("renameElement", () => {
    test(USE_CASE_NAME, () => {
      const xmlDocument = documentFromXml(`<root lang="en" id="ID"><child/></root>`);
      const { documentElement: originalElement } = xmlDocument;

      renameElement(originalElement, "renamed");

      expect(serializeToXmlString(xmlDocument)).toStrictEqual(`<renamed lang="en" id="ID"><child/></renamed>`);
    });

    test("should be possible to rename element just by providing its qualified name", () => {
      const xmlDocument = documentFromXml(`<root/>`);
      const { documentElement: originalElement } = xmlDocument;
      const newName = "renamed";

      const renamedElement = renameElement(originalElement, newName);

      const { namespaceURI, nodeName, localName, tagName } = renamedElement;

      expect(namespaceURI).toStrictEqual(originalElement.namespaceURI);
      expect(nodeName).toStrictEqual(newName);
      expect(localName).toStrictEqual(newName);
      expect(tagName).toStrictEqual(newName);
    });

    test("should be possible to rename element by providing its full definition", () => {
      const xmlDocument = documentFromXml(`<root/>`);
      const { documentElement: originalElement } = xmlDocument;
      const newPrefix = "c";
      const newName = "renamed";
      const qualifiedName = `${newPrefix}:${newName}`;
      const newNamespaceURI = "https://example.org/ns/custom";
      const definition: ElementDefinition = {
        namespaceURI: newNamespaceURI,
        qualifiedName,
      };

      const renamedElement = renameElement(originalElement, definition);

      const { namespaceURI, nodeName, localName, tagName } = renamedElement;

      expect(namespaceURI).toStrictEqual(newNamespaceURI);
      expect(nodeName).toStrictEqual(qualifiedName);
      expect(localName).toStrictEqual(newName);
      expect(tagName).toStrictEqual(qualifiedName);
    });

    test("should move children, if requested by `deep=true` (default)", () => {
      const xmlDocument = documentFromXml(`<root><child/></root>`);
      const { documentElement: originalElement } = xmlDocument;

      renameElement(originalElement, "renamed");

      expect(serializeToXmlString(xmlDocument)).toStrictEqual(`<renamed><child/></renamed>`);
    });

    test("should not move children, if requested by `deep=false`", () => {
      const xmlDocument = documentFromXml(`<root><child/></root>`);
      const { documentElement: originalElement } = xmlDocument;

      renameElement(originalElement, "renamed", false);

      expect(serializeToXmlString(xmlDocument)).toStrictEqual(`<renamed/>`);
    });

    test("should copy all attributes to new element", () => {
      const xmlDocument = documentFromXml(`<root lang="en" id="ID"/>`);
      const { documentElement: originalElement } = xmlDocument;

      renameElement(originalElement, "renamed");

      expect(serializeToXmlString(xmlDocument)).toStrictEqual(`<renamed lang="en" id="ID"/>`);
    });
  });

  describe("removeClass", () => {
    test("should be able to clean up class attribute (optional corner case)", () => {
      const xmlDocument = documentFromXml(`<root class="CLASS"/>`);
      const element = xmlDocument.documentElement;
      element.classList.remove("CLASS");
      // Just checking our observation, that the class attribute still exists.
      expect(element.hasAttribute("class")).toStrictEqual(true);
      removeClass(element);
      expect(element.hasAttribute("class")).toStrictEqual(false);
    });

    test("should remove class 'without traces'", () => {
      const xmlDocument = documentFromXml(`<root class="CLASS"/>`);
      const element = xmlDocument.documentElement;
      removeClass(element, "CLASS");
      expect(element.hasAttribute("class")).toStrictEqual(false);
    });

    test("should keep other classes", () => {
      const xmlDocument = documentFromXml(`<root class="CLASS1 CLASS2"/>`);
      const element = xmlDocument.documentElement;
      removeClass(element, "CLASS1");
      expect([...element.classList]).toStrictEqual(["CLASS2"]);
    });
  });
});
