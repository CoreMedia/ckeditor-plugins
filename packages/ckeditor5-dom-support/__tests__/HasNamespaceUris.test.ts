import { USE_CASE_NAME } from "./Constants";
import { documentFromHtml } from "../src/Documents";
import { isHasNamespaceUri } from "../src/HasNamespaceUris";

const htmlDocument = documentFromHtml(`<html lang="aa" id="ID"/>`);
const langAttribute = htmlDocument.documentElement.getAttributeNode("lang");

describe("HasNamespaceUris", () => {
  describe("isHasNamespaceUri", () => {
    it(USE_CASE_NAME, () => {
      const value: unknown = htmlDocument;
      if (isHasNamespaceUri(value)) {
        // We can now access `value`.
        expect(value.namespaceURI).toBeDefined();
      }
    });

    it.each`
      matched
      ${langAttribute}
      ${htmlDocument.documentElement}
    `("[$#] should match any node providing namespaceURI: $matched", ({ matched }: { matched: unknown }) => {
      expect(isHasNamespaceUri(matched)).toBeTruthy();
    });

    it.each`
      unmatched
      ${undefined}
      ${null}
    `(
      "[$#] should not match any other objects than HasNamespaceUris: $unmatched",
      ({ unmatched }: { unmatched: unknown }) => {
        expect(isHasNamespaceUri(unmatched)).toBeFalsy();
      }
    );
  });
});
