import "global-jsdom/register";
import test, { describe } from "node:test";
import expect from "expect";
import { USE_CASE_NAME } from "./Constants";
import { documentFromXml } from "../src/Documents";
import { isAttr, copyAttributesFrom } from "../src/Attrs";
import { serializeToXmlString } from "../src/Nodes";

const onlyRootXmlDocument = documentFromXml(`<root lang="en" id="ID"/>`);
const langAttribute = onlyRootXmlDocument.documentElement.getAttributeNode("lang");
const idAttribute = onlyRootXmlDocument.documentElement.getAttributeNode("id");

void describe("Attrs", () => {
  void describe("isAttr", () => {
    test(USE_CASE_NAME, () => {
      const value: unknown = langAttribute;
      if (isAttr(value)) {
        // We can now access `value`.
        expect(value.value).toBeDefined();
      }
    });

    const cases = [langAttribute, idAttribute];

    for (const [i, matched] of cases.entries()) {
      void test(`[${i}] should match any Attribute: ${matched}`, () => {
        expect(isAttr(matched)).toBeTruthy();
      });
    }

    const cases2 = [undefined, null, langAttribute?.ownerDocument];

    for (const [i, unmatched] of cases2.entries()) {
      void test(`[${i}] should not match any other objects than Attributes: ${unmatched}`, () => {
        expect(isAttr(unmatched)).toBeFalsy();
      });
    }
  });

  void describe("copyAttributesFrom", () => {
    test(USE_CASE_NAME, () => {
      const { documentElement } = onlyRootXmlDocument;
      const { namespaceURI } = documentElement;
      const targetElement = onlyRootXmlDocument.createElementNS(namespaceURI, "child");

      documentElement.append(targetElement);

      copyAttributesFrom(documentElement, targetElement);

      expect(serializeToXmlString(onlyRootXmlDocument)).toStrictEqual(
        `<root lang="en" id="ID"><child lang="en" id="ID"/></root>`,
      );
    });
  });
});
