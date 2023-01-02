import { USE_CASE_NAME } from "./Constants";
import { documentFromHtml } from "../src/Documents";
import { isAttr } from "../src/Attrs";

const langAttribute = documentFromHtml(`<html lang="aa">`).documentElement.getAttributeNode("lang");
const idAttribute = documentFromHtml(`<html lang="aa" id="ID">`).documentElement.getAttributeNode("id");

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
});
