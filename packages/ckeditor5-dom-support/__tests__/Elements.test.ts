import { USE_CASE_NAME } from "./Constants";
import { documentFromHtml, documentFromXml } from "../src/Documents";
import { isElement } from "../src/Elements";

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
});
