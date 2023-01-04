import { USE_CASE_NAME } from "./Constants";
import { documentFromHtml, documentFromXml } from "../src/Documents";
import { HTMLTableElementWrapper, isHTMLTableElement, wrapIfTableElement } from "../src/HTMLTableElements";

describe("HTMLTableElements", () => {
  describe("isHTMLTableElement", () => {
    it(USE_CASE_NAME, () => {
      const node: Node | null = documentFromHtml("<body><table/></body>").body.firstElementChild;
      if (isHTMLTableElement(node)) {
        // We can now use convenience API.
        expect(node.createTHead()).toBeDefined();
      }
    });

    it("should match HTML table elements", () => {
      const node: Node | null = documentFromHtml("<body><table/></body>").body.firstElementChild;
      expect(isHTMLTableElement(node)).toBeTruthy();
    });

    it.each`
      unmatched
      ${undefined}
      ${null}
      ${documentFromHtml("<body/>")}
      ${documentFromXml("<root><table/></root>").documentElement.firstElementChild}
    `(
      "[$#] should not match any other objects than HTMLTableElement: $unmatched",
      ({ unmatched }: { unmatched: unknown }) => {
        expect(isHTMLTableElement(unmatched)).toBeFalsy();
      }
    );
  });

  describe("wrapIfTableElement", () => {
    it(USE_CASE_NAME, () => {
      const element: Element | null = documentFromHtml("<body><table/></body>").body.firstElementChild;
      if (element) {
        // Provides ability for small one-liners.
        wrapIfTableElement(element)?.removeEmptySections();
      }
    });

    it.each`
      matched
      ${documentFromHtml("<body><table/></body>").body.firstElementChild}
      ${documentFromXml("<root><table/></root>").documentElement.firstElementChild}
    `("[$#] should wrap HTML table (alike) element: $matched", ({ matched }: { matched: Element }) => {
      expect(wrapIfTableElement(matched)).toBeDefined();
    });

    it("should skip wrapping, if no HTML table (alike) element", () => {
      const element = documentFromHtml("<body><table/></body>").body;
      expect(wrapIfTableElement(element)).toBeUndefined();
    });
  });

  describe("HTMLTableElementWrapper", () => {
    describe("constructor", () => {
      it("should successfully create wrapper for native HTMLTableElement", () => {
        const element = documentFromHtml("<body><table/></body>").body.firstElementChild;
        if (element) {
          const wrapper = new HTMLTableElementWrapper(element);
          expect(wrapper.native).toStrictEqual(true);
        }
      });

      it("should successfully create wrapper for non-native HTMLTableElement", () => {
        const element = documentFromXml("<root><table/></root>").documentElement.firstElementChild;
        if (element) {
          const wrapper = new HTMLTableElementWrapper(element);
          expect(wrapper.native).toStrictEqual(false);
        }
      });

      it("should fail to create wrapper for unmatched elements", () => {
        const element = documentFromXml("<root><table/></root>").documentElement;
        expect(() => new HTMLTableElementWrapper(element)).toThrowError();
      });
    });

    // TODO: More tests for HTMLTableElementWrapper pending.
  });
});
