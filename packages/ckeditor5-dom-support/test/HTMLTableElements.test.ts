import "global-jsdom/register";
import test, { describe } from "node:test";
import expect from "expect";
import { USE_CASE_NAME } from "./Constants";
import { documentFromHtml, documentFromXml } from "../src/Documents";
import { HTMLTableElementWrapper, isHTMLTableElement, wrapIfTableElement } from "../src/HTMLTableElements";

void describe("HTMLTableElements", () => {
  void describe("isHTMLTableElement", () => {
    test(USE_CASE_NAME, () => {
      const node: Node | null = documentFromHtml("<body><table/></body>").body.firstElementChild;
      if (isHTMLTableElement(node)) {
        // We can now use convenience API.
        expect(node.createTHead()).toBeDefined();
      }
    });

    void test("should match HTML table elements", () => {
      const node: Node | null = documentFromHtml("<body><table/></body>").body.firstElementChild;
      expect(isHTMLTableElement(node)).toBeTruthy();
    });

    const unmatchedCases = [
      undefined,
      null,
      documentFromHtml("<body/>"),
      documentFromXml("<root><table/></root>").documentElement.firstElementChild,
    ];

    for (const [i, unmatched] of unmatchedCases.entries()) {
      void test(`[${i}] should not match any other objects than HTMLTableElement: ${String(unmatched)}`, () => {
        expect(isHTMLTableElement(unmatched)).toBeFalsy();
      });
    }
  });

  void describe("wrapIfTableElement", () => {
    test(USE_CASE_NAME, () => {
      const element: Element | null = documentFromHtml("<body><table/></body>").body.firstElementChild;
      if (element) {
        // Provides ability for small one-liners.
        wrapIfTableElement(element)?.removeEmptySections();
      }
    });

    const matchedCases = [
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      documentFromHtml("<body><table/></body>").body.firstElementChild!,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      documentFromXml("<root><table/></root>").documentElement.firstElementChild!,
    ];

    for (const [i, matched] of matchedCases.entries()) {
      void test(`[${i}] should wrap HTML table (alike) element: ${matched.localName}`, () => {
        expect(wrapIfTableElement(matched)).toBeDefined();
      });
    }

    void test("should skip wrapping, if no HTML table (alike) element", () => {
      const element = documentFromHtml("<body><table/></body>").body;
      expect(wrapIfTableElement(element)).toBeUndefined();
    });
  });

  void describe("HTMLTableElementWrapper", () => {
    void describe("constructor", () => {
      void test("should successfully create wrapper for native HTMLTableElement", () => {
        const element = documentFromHtml("<body><table/></body>").body.firstElementChild;
        if (element) {
          const wrapper = new HTMLTableElementWrapper(element);
          expect(wrapper.native).toStrictEqual(true);
        }
      });

      void test("should successfully create wrapper for non-native HTMLTableElement", () => {
        const element = documentFromXml("<root><table/></root>").documentElement.firstElementChild;
        if (element) {
          const wrapper = new HTMLTableElementWrapper(element);
          expect(wrapper.native).toStrictEqual(false);
        }
      });

      void test("should fail to create wrapper for unmatched elements", () => {
        const element = documentFromXml("<root><table/></root>").documentElement;
        expect(() => new HTMLTableElementWrapper(element)).toThrow(Error);
      });
    });

    // TODO: More tests for HTMLTableElementWrapper pending.
  });
});
