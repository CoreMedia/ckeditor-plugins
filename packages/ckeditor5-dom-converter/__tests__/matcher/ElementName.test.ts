import { dataNs, dataViewNs, element, first, html, select, xml } from "./ElementUtils";
import { compileElementNameMatcherPattern, ElementNameExpression, matchedName } from "../../src/matcher/ElementName";

describe("matcher.ElementName", () => {
  /*
   * =======================================[ compileElementNameMatcherPattern ]
   */
  describe("compileElementNameMatcherPattern", () => {
    it("should match on localName for pattern given as string", () => {
      const matching = element(xml(`<div xmlns="${dataNs}"><p/></div>`), first());
      const nonMatching = element(xml(`<div xmlns="${dataNs}"><span/></div>`), first());

      const compiled = compileElementNameMatcherPattern("p");

      expect(compiled(matching)).toStrictEqual(true);
      expect(compiled(nonMatching)).toStrictEqual(false);
    });

    it("should match on localName for pattern given as regular expression", () => {
      const matching = element(xml(`<div xmlns="${dataNs}"><p/></div>`), first());
      const nonMatching = element(xml(`<div xmlns="${dataNs}"><span/></div>`), first());

      const compiled = compileElementNameMatcherPattern(/^p$/);

      expect(compiled(matching)).toStrictEqual(true);
      expect(compiled(nonMatching)).toStrictEqual(false);
    });

    it("should always match on tautological pattern (`true` or empty expression)", () => {
      const matching = element(xml(`<div xmlns="${dataNs}"><p/></div>`), first());
      const otherMatching = element(xml(`<div xmlns="${dataNs}"><span/></div>`), first());

      const compiledTrue = compileElementNameMatcherPattern(true);
      const compiledEmpty = compileElementNameMatcherPattern({});

      expect(compiledTrue(matching)).toStrictEqual(true);
      expect(compiledTrue(otherMatching)).toStrictEqual(true);
      expect(compiledEmpty(matching)).toStrictEqual(true);
      expect(compiledEmpty(otherMatching)).toStrictEqual(true);
    });

    it.each`
      expression                                      | matches
      ${{ namespaceURI: dataNs }}                     | ${true}
      ${{ namespaceURI: dataViewNs }}                 | ${false}
      ${{ namespaceURI: null }}                       | ${false}
      ${{ localName: "p" }}                           | ${true}
      ${{ localName: "span" }}                        | ${false}
      ${{ nodeName: "rt:p" }}                         | ${true}
      ${{ nodeName: "p" }}                            | ${false}
      ${{ tagName: "rt:p" }}                          | ${true}
      ${{ tagName: "p" }}                             | ${false}
      ${{ prefix: "rt" }}                             | ${true}
      ${{ prefix: "x" }}                              | ${false}
      ${{ prefix: null }}                             | ${false}
      ${{ namespaceURI: dataNs, localName: "p" }}     | ${true}
      ${{ namespaceURI: dataViewNs, localName: "p" }} | ${false}
      ${{ namespaceURI: dataNs, localName: "span" }}  | ${false}
    `(
      "[$#] should compile expression $expression to check specified criteria and signal match: $matches",
      ({ expression, matches }: { expression: ElementNameExpression; matches: boolean }) => {
        const probe = element(xml(`<rt:div xmlns:rt="${dataNs}"><rt:p/></rt:div>`), first());
        const compiled = compileElementNameMatcherPattern(expression);
        expect(compiled(probe)).toStrictEqual(matches);
      }
    );
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
          prefix: null,
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
          prefix: null,
        };
        expect(match).toStrictEqual(expected);
      });
    });
  });
});
