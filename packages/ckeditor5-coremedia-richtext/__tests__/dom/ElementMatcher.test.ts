import { CompiledMatcherPattern, compileElementMatcherPattern, matchedName } from "../../src/dom/ElementMatcher";

const parser = new DOMParser();
const serializer = new XMLSerializer();

const dataNs = "http://www.coremedia.com/2003/richtext-1.0";
const dataViewNs = "http://www.w3.org/1999/xhtml";

const serialize = (node: Node): string => {
  try {
    return serializer.serializeToString(node);
  } catch (e) {
    return `Serialization failed: ${e}`;
  }
};

const html = (htmlString: string): Document => parser.parseFromString(htmlString, "text/html");
const xml = (xmlString: string): Document => parser.parseFromString(xmlString, "text/xml");

type ElementSelector = (doc: Document) => Element;

const first =
  (): ElementSelector =>
  (doc: Document): Element => {
    const { documentElement } = doc;
    const { firstElementChild } = documentElement;
    if (!firstElementChild) {
      throw new Error(`first: Missing first element: ${serialize(doc)}`);
    }
    return firstElementChild;
  };

const select =
  (selectors: string): ElementSelector =>
  (doc: Document): Element => {
    const result = doc.querySelector(selectors);
    if (!result) {
      throw new Error(`select: Cannot find element by selectors "${selectors}" in: ${serialize(doc)}`);
    }
    return result;
  };

const element = (doc: Document, selector: ElementSelector) => selector(doc);

describe("ElementMatcher", () => {
  /*
   * ===========================================[ compileElementMatcherPattern ]
   */
  describe("compileElementMatcherPattern", () => {
    it.each`
      pattern
      ${"p"}
      ${/^p$/}
    `(
      "[$#] should provide matcher for element's localName for plain string/regexp: $pattern",
      ({ pattern }: { pattern: string | RegExp }) => {
        const compiled = compileElementMatcherPattern(pattern);
        expect(compiled).toBeDefined();
        // validating pattern
        const matching = element(html(`<div><p/></div>`), select("p"));
        const notMatching = element(html(`<div><span/></div>`), select("span"));
        const expectedNameMatch: ReturnType<typeof matchedName> = {
          namespaceURI: dataViewNs,
          localName: "p",
          nodeName: "P",
          tagName: "P",
          prefix: undefined,
        };
        const expectedOnMatch: ReturnType<CompiledMatcherPattern> = {
          name: expectedNameMatch,
        };
        expect(compiled(matching)).toStrictEqual(expectedOnMatch);
        expect(compiled(notMatching)).toStrictEqual(false);
      }
    );

    it("should provide function based matcher element matcher as is", () => {
      const pattern = compileElementMatcherPattern("p");
      const compiled = compileElementMatcherPattern(pattern);

      const matching = element(html(`<div><p/></div>`), select("p"));
      const notMatching = element(html(`<div><span/></div>`), select("span"));

      expect(compiled(matching)).toStrictEqual(pattern(matching));
      expect(compiled(notMatching)).toStrictEqual(pattern(notMatching));
    });
  });

  /*
   * ============================================================[ matchedName ]
   */
  describe("matchedName", () => {
    describe("From XML Data", () => {
      it("should provide matched name details for element with document namespace", () => {
        const matched = element(xml(`<div xmlns="${dataNs}"><p/></div>`), first());
        const match = matchedName(matched);
        const expected: ReturnType<typeof matchedName> = {
          namespaceURI: dataNs,
          localName: "p",
          nodeName: "p",
          tagName: "p",
          prefix: undefined,
        };
        expect(match).toStrictEqual(expected);
      });

      it("should provide matched name details for element with prefixed document namespace", () => {
        const matched = element(xml(`<rt:div xmlns:rt="${dataNs}"><rt:p/></rt:div>`), first());
        const match = matchedName(matched);
        const expected: ReturnType<typeof matchedName> = {
          namespaceURI: dataNs,
          localName: "p",
          nodeName: "rt:p",
          tagName: "rt:p",
          prefix: "rt",
        };
        expect(match).toStrictEqual(expected);
      });
    });

    describe("From HTML Data View", () => {
      it("should provide matched name details for HTML element", () => {
        const matched = element(html(`<div><p/></div>`), select("p"));
        const match = matchedName(matched);
        const expected: ReturnType<typeof matchedName> = {
          namespaceURI: dataViewNs,
          localName: "p",
          nodeName: "P",
          tagName: "P",
          prefix: undefined,
        };
        expect(match).toStrictEqual(expected);
      });
    });
  });
});
