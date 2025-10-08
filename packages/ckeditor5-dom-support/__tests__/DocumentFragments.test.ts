import "global-jsdom/register";
import test, { describe } from "node:test";
import expect from "expect";
import { USE_CASE_NAME } from "./Constants";
import { fragmentFromNodeContents, isDocumentFragment } from "../src/DocumentFragments";
import { documentFromHtml } from "../src/Documents";

describe("DocumentFragments", () => {
  describe("fragmentFromNodeContents", () => {
    test(USE_CASE_NAME, () => {
      const htmlDocument = documentFromHtml("<body><p>1</p><p>2</p></body>");
      const fragment = fragmentFromNodeContents(htmlDocument.body);
      expect(fragment.childElementCount).toStrictEqual(2);
    });
  });

  describe("isDocumentFragment", () => {
    test(USE_CASE_NAME, () => {
      const node: Node = new DocumentFragment();
      if (isDocumentFragment(node)) {
        // We can now access `ownerDocument`.
        expect(node.ownerDocument).toBeDefined();
      }
    });

    const cases = [
      { matched: new DocumentFragment() },
      { matched: fragmentFromNodeContents(documentFromHtml("<body/>").body) },
    ];

    for (const [i, { matched }] of cases.entries()) {
      test(`[${i}] should match DocumentFragment`, () => {
        expect(isDocumentFragment(matched)).toBeTruthy();
      });
    }

    const cases2: { unmatched: unknown }[] = [
      { unmatched: undefined },
      { unmatched: null },
      { unmatched: documentFromHtml("<body/>") },
    ];

    for (const [i, { unmatched }] of cases2.entries()) {
      test(`[${i}] should not match any other objects than DocumentFragments`, () => {
        expect(isDocumentFragment(unmatched)).toBeFalsy();
      });
    }
  });
});
