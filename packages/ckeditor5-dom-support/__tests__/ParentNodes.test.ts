import { USE_CASE_NAME } from "./Constants";
import { documentFromHtml, documentFromXml } from "../src/Documents";
import { isParentNode } from "../src/ParentNodes";

describe("ParentNodes", () => {
  describe("isParentNodes", () => {
    it(USE_CASE_NAME, () => {
      const node: Node = documentFromHtml("<body/>");
      if (isParentNode(node)) {
        // We can now access `childElementCount`.
        expect(node.childElementCount).toBeDefined();
      }
    });

    it.each`
      matched
      ${new DocumentFragment()}
      ${documentFromHtml("<body/>")}
      ${documentFromHtml("<body/>").body}
      ${documentFromXml("<root><child/></root>").firstElementChild}
    `("[$#] should match any ParentNode: $matched", ({ matched }: { matched: unknown }) => {
      expect(isParentNode(matched)).toBeTruthy();
    });

    it.each`
      unmatched
      ${undefined}
      ${null}
      ${documentFromHtml("<body>Text</body>").body.firstChild}
    `(
      "[$#] should not match any other objects than ParentNodes: $unmatched",
      ({ unmatched }: { unmatched: unknown }) => {
        expect(isParentNode(unmatched)).toBeFalsy();
      }
    );
  });
});
