import { documentFromHtml, documentFromXml } from "../src/Documents";
import { ElementDefinition, isElement, removeClass, renameElement } from "../src/Elements";
import { serializeToXmlString } from "../src/Nodes";
import { USE_CASE_NAME } from "./Constants";

describe("Elements", () => {
  describe("isElement", () => {
    it(USE_CASE_NAME, () => {
      const node: Node = documentFromHtml("<body/>").body;
      if (isElement(node)) {
        // We can now access `outerHTML`.
        expect(node.outerHTML).toBeDefined();
      }
    });

    it.each`
      matched
      ${documentFromHtml("<body/>").body}
      ${documentFromXml("<root><child/></root>").firstElementChild}
    `("[$#] should match any Element: $matched", ({ matched }: { matched: unknown }) => {
      expect(isElement(matched)).toBeTruthy();
    });

    it.each`
      unmatched
      ${undefined}
      ${null}
      ${documentFromHtml("<body/>")}
    `("[$#] should not match any other objects than Elements: $unmatched", ({ unmatched }: { unmatched: unknown }) => {
      expect(isElement(unmatched)).toBeFalsy();
    });
  });

  describe("renameElement", () => {
    it(USE_CASE_NAME, () => {
      const xmlDocument = documentFromXml(`<root lang="en" id="ID"><child/></root>`);
      const { documentElement: originalElement } = xmlDocument;

      renameElement(originalElement, "renamed");

      expect(serializeToXmlString(xmlDocument)).toStrictEqual(`<renamed lang="en" id="ID"><child/></renamed>`);
    });

    it("should be possible to rename element just by providing its qualified name", () => {
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

    it("should be possible to rename element by providing its full definition", () => {
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

    it("should move children, if requested by `deep=true` (default)", () => {
      const xmlDocument = documentFromXml(`<root><child/></root>`);
      const { documentElement: originalElement } = xmlDocument;

      renameElement(originalElement, "renamed");

      expect(serializeToXmlString(xmlDocument)).toStrictEqual(`<renamed><child/></renamed>`);
    });

    it("should not move children, if requested by `deep=false`", () => {
      const xmlDocument = documentFromXml(`<root><child/></root>`);
      const { documentElement: originalElement } = xmlDocument;

      renameElement(originalElement, "renamed", false);

      expect(serializeToXmlString(xmlDocument)).toStrictEqual(`<renamed/>`);
    });

    it("should copy all attributes to new element", () => {
      const xmlDocument = documentFromXml(`<root lang="en" id="ID"/>`);
      const { documentElement: originalElement } = xmlDocument;

      renameElement(originalElement, "renamed");

      expect(serializeToXmlString(xmlDocument)).toStrictEqual(`<renamed lang="en" id="ID"/>`);
    });
  });

  describe("removeClass", () => {
    it("should be able to clean up class attribute (optional corner case)", () => {
      const xmlDocument = documentFromXml(`<root class="CLASS"/>`);
      const element = xmlDocument.documentElement;
      element.classList.remove("CLASS");
      // Just checking our observation, that the class attribute still exists.
      expect(element.hasAttribute("class")).toStrictEqual(true);
      removeClass(element);
      expect(element.hasAttribute("class")).toStrictEqual(false);
    });

    it("should remove class 'without traces'", () => {
      const xmlDocument = documentFromXml(`<root class="CLASS"/>`);
      const element = xmlDocument.documentElement;
      removeClass(element, "CLASS");
      expect(element.hasAttribute("class")).toStrictEqual(false);
    });

    it("should keep other classes", () => {
      const xmlDocument = documentFromXml(`<root class="CLASS1 CLASS2"/>`);
      const element = xmlDocument.documentElement;
      removeClass(element, "CLASS1");
      expect([...element.classList]).toStrictEqual(["CLASS2"]);
    });
  });
});
