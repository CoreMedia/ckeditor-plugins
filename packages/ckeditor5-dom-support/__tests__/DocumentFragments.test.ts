import { fragmentFromNodeContents, isDocumentFragment } from "../src/DocumentFragments";
import { documentFromHtml } from "../src/Documents";
import { USE_CASE_NAME } from "./Constants";

describe("DocumentFragments", () => {
  describe("fragmentFromNodeContents", () => {
    it(USE_CASE_NAME, () => {
      const htmlDocument = documentFromHtml("<body><p>1</p><p>2</p></body>");
      const fragment = fragmentFromNodeContents(htmlDocument.body);
      expect(fragment.childElementCount).toStrictEqual(2);
    });
  });

  describe("isDocumentFragment", () => {
    it(USE_CASE_NAME, () => {
      const node: Node = new DocumentFragment();
      if (isDocumentFragment(node)) {
        // We can now access `ownerDocument`.
        expect(node.ownerDocument).toBeDefined();
      }
    });

    it.each`
      matched
      ${new DocumentFragment()}
      ${fragmentFromNodeContents(documentFromHtml("<body/>").body)}
    `("[$#] should match any DocumentFragment: $matched", ({ matched }: { matched: unknown }) => {
      expect(isDocumentFragment(matched)).toBeTruthy();
    });

    it.each`
      unmatched
      ${undefined}
      ${null}
      ${documentFromHtml("<body/>")}
    `(
      "[$#] should not match any other objects than DocumentFragments: $unmatched",
      ({ unmatched }: { unmatched: unknown }) => {
        expect(isDocumentFragment(unmatched)).toBeFalsy();
      },
    );
  });
});
