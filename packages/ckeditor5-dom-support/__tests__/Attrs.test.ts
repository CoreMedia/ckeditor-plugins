import { USE_CASE_NAME } from "./Constants";
import { documentFromXml } from "../src/Documents";
import { isAttr, copyAttributesFrom } from "../src/Attrs";
import { serializeToXmlString } from "../src/Nodes";

const onlyRootXmlDocument = documentFromXml(`<root lang="en" id="ID"/>`);
const langAttribute = onlyRootXmlDocument.documentElement.getAttributeNode("lang");
const idAttribute = onlyRootXmlDocument.documentElement.getAttributeNode("id");

describe("Attrs", () => {
  describe("isAttr", () => {
    it(USE_CASE_NAME, () => {
      const value: unknown = langAttribute;
      if (isAttr(value)) {
        // We can now access `value`.
        expect(value.value).toBeDefined();
      }
    });

    it.each`
      matched
      ${langAttribute}
      ${idAttribute}
    `("[$#] should match any Attribute: $matched", ({ matched }: { matched: unknown }) => {
      expect(isAttr(matched)).toBeTruthy();
    });

    it.each`
      unmatched
      ${undefined}
      ${null}
      ${langAttribute?.ownerDocument}
    `(
      "[$#] should not match any other objects than Attributes: $unmatched",
      ({ unmatched }: { unmatched: unknown }) => {
        expect(isAttr(unmatched)).toBeFalsy();
      }
    );
  });

  describe("copyAttributesFrom", () => {
    it(USE_CASE_NAME, () => {
      const { documentElement } = onlyRootXmlDocument;
      const { namespaceURI } = documentElement;
      const targetElement = onlyRootXmlDocument.createElementNS(namespaceURI, "child");

      documentElement.append(targetElement);

      copyAttributesFrom(documentElement, targetElement);

      expect(serializeToXmlString(onlyRootXmlDocument)).toStrictEqual(
        `<root lang="en" id="ID"><child lang="en" id="ID"/></root>`
      );
    });
  });
});
