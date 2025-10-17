import test, { describe } from "node:test";
import expect from "expect";
import { documentFromHtml, documentFromXml } from "../src/Documents";
import { isParentNode } from "../src/ParentNodes";
import { USE_CASE_NAME } from "./Constants";

void describe("ParentNodes", () => {
  void describe("isParentNodes", () => {
    void test(USE_CASE_NAME, () => {
      const node: Node = documentFromHtml("<body/>");
      if (isParentNode(node)) {
        // We can now access `childElementCount`.
        expect(node.childElementCount).toBeDefined();
      }
    });

    const matchedCases = [
      new DocumentFragment(),
      documentFromHtml("<body/>"),
      documentFromHtml("<body/>").body,
      documentFromXml("<root><child/></root>").firstElementChild,
    ];

    for (const [i, matched] of matchedCases.entries()) {
      void test(`[${i}] should match any ParentNode: ${matched instanceof Node ? matched.nodeName : String(matched)}`, () => {
        expect(isParentNode(matched)).toBeTruthy();
      });
    }

    const unmatchedCases = [undefined, null, documentFromHtml("<body>Text</body>").body.firstChild];

    for (const [i, unmatched] of unmatchedCases.entries()) {
      void test(`[${i}] should not match any other objects than ParentNodes: ${
        unmatched instanceof Node ? unmatched.nodeName : String(unmatched)
      }`, () => {
        expect(isParentNode(unmatched)).toBeFalsy();
      });
    }
  });
});
