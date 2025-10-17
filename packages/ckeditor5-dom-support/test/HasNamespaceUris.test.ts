import "./setup.js";
import test, { describe } from "node:test";
import expect from "expect";
import { documentFromHtml } from "../src/Documents";
import { isHasNamespaceUri } from "../src/HasNamespaceUris";
import { USE_CASE_NAME } from "./Constants";

const htmlDocument = documentFromHtml(`<html lang="aa" id="ID"/>`);
const langAttribute = htmlDocument.documentElement.getAttributeNode("lang");

void describe("HasNamespaceUris", () => {
  void describe("isHasNamespaceUri", () => {
    void test(USE_CASE_NAME, () => {
      const value: unknown = htmlDocument;
      if (isHasNamespaceUri(value)) {
        // We can now access `value`.
        expect(value.namespaceURI).toBeDefined();
      }
    });

    const matchedCases = [langAttribute, htmlDocument.documentElement];

    for (const [i, matched] of matchedCases.entries()) {
      void test(`[${i}] should match any node providing namespaceURI: ${String(matched)}`, () => {
        expect(isHasNamespaceUri(matched)).toBeTruthy();
      });
    }

    const unmatchedCases = [undefined, null];

    for (const [i, unmatched] of unmatchedCases.entries()) {
      void test(`[${i}] should not match any other objects than HasNamespaceUris: ${String(unmatched)}`, () => {
        expect(isHasNamespaceUri(unmatched)).toBeFalsy();
      });
    }
  });
});
