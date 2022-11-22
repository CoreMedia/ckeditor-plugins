import { dataNs, dataViewNs, element, first, html, select, xml } from "../ElementUtils";
import { compileElementMatcherPattern, ElementMatcherPattern, ElementPredicate } from "../../src/matcher/Element";
import { matchedName } from "../../src/matcher/ElementName";

const htmlEmptyParagraph = element(html(`<div><p/></div>`), select("p"));
const rtEmptyParagraph = element(xml(`<div xmlns="${dataNs}"><p/></div>`), select("p"));
const rtEmptyPrefixedParagraph = element(xml(`<rt:div xmlns:rt="${dataNs}"><rt:p/></rt:div>`), first());

const htmlEmptySpan = element(html(`<div><span/></div>`), select("span"));
const rtEmptySpan = element(xml(`<div xmlns="${dataNs}"><span/></div>`), select("span"));
const rtEmptyPrefixedSpan = element(xml(`<rt:div xmlns:rt="${dataNs}"><rt:span/></rt:div>`), first());

const classList = ["lorem", "ipsum"];
const classes = classList.join(" ");
const htmlParagraphWithClasses = element(html(`<div><p class="${classes}"/></div>`), select("p"));
const rtParagraphWithClasses = element(xml(`<div xmlns="${dataNs}"><p class="${classes}"/></div>`), select("p"));
const rtPrefixedParagraphWithClasses = element(
  xml(`<rt:div xmlns:rt="${dataNs}"><rt:p rt:class="${classes}"/></rt:div>`),
  first()
);

describe("matcher.Element", () => {
  it.each`
    element
    ${htmlEmptyParagraph}
    ${rtEmptyParagraph}
    ${rtEmptyPrefixedParagraph}
    ${htmlEmptySpan}
    ${rtEmptySpan}
    ${rtEmptyPrefixedSpan}
  `("[$#] should match any element if pattern is `true` for: $element", ({ element }: { element: Element }) => {
    const compiled = compileElementMatcherPattern(true);
    // We don't expect any details. This is a design decisions, which may
    // be discussed. Alternative would be to expose all element details, that
    // could theoretically be validated (such as returning element name details,
    // all classes in classList of element, ...).
    expect(compiled(element)).toStrictEqual({});
  });

  it.each`
    pattern  | element                     | expectedMatch
    ${"p"}   | ${htmlEmptyParagraph}       | ${true}
    ${"p"}   | ${rtEmptyParagraph}         | ${true}
    ${"p"}   | ${rtEmptyPrefixedParagraph} | ${true}
    ${"p"}   | ${htmlEmptySpan}            | ${false}
    ${"p"}   | ${rtEmptySpan}              | ${false}
    ${"p"}   | ${rtEmptyPrefixedSpan}      | ${false}
    ${/^p$/} | ${htmlEmptyParagraph}       | ${true}
    ${/^p$/} | ${rtEmptyParagraph}         | ${true}
    ${/^p$/} | ${rtEmptyPrefixedParagraph} | ${true}
    ${/^p$/} | ${htmlEmptySpan}            | ${false}
    ${/^p$/} | ${rtEmptySpan}              | ${false}
    ${/^p$/} | ${rtEmptyPrefixedSpan}      | ${false}
  `(
    "[$#] should provide expected result for pattern (interpreted as `localName`): $element matches $pattern = $expectedMatch",
    ({ pattern, element, expectedMatch }: { pattern: string | RegExp; element: Element; expectedMatch: boolean }) => {
      const compiled = compileElementMatcherPattern(pattern);
      if (!expectedMatch) {
        expect(compiled(element)).toStrictEqual(false);
      } else {
        const name = matchedName(element);
        expect(compiled(element)).toStrictEqual({ name });
      }
    }
  );

  it.each`
    pattern                            | element                           | expectedMatch                      | comment
    ${{ classes: "lorem" }}            | ${htmlParagraphWithClasses}       | ${{ classes: ["lorem"] }}          | ${""}
    ${{ classes: ["lorem", "ipsum"] }} | ${htmlParagraphWithClasses}       | ${{ classes: ["lorem", "ipsum"] }} | ${""}
    ${{ classes: "dolor" }}            | ${htmlParagraphWithClasses}       | ${false}                           | ${""}
    ${{ classes: ["lorem", "dolor"] }} | ${htmlParagraphWithClasses}       | ${false}                           | ${""}
    ${{ classes: "lorem" }}            | ${rtParagraphWithClasses}         | ${{ classes: ["lorem"] }}          | ${""}
    ${{ classes: ["lorem", "ipsum"] }} | ${rtParagraphWithClasses}         | ${{ classes: ["lorem", "ipsum"] }} | ${""}
    ${{ classes: "dolor" }}            | ${rtParagraphWithClasses}         | ${false}                           | ${""}
    ${{ classes: ["lorem", "dolor"] }} | ${rtParagraphWithClasses}         | ${false}                           | ${""}
    ${{ classes: "lorem" }}            | ${rtPrefixedParagraphWithClasses} | ${false}                           | ${"(Element.classList cannot access prefixed 'class' attributes)"}
    ${{ classes: ["lorem", "ipsum"] }} | ${rtPrefixedParagraphWithClasses} | ${false}                           | ${"(Element.classList cannot access prefixed 'class' attributes)"}
    ${{ classes: "dolor" }}            | ${rtPrefixedParagraphWithClasses} | ${false}                           | ${""}
    ${{ classes: ["lorem", "dolor"] }} | ${rtPrefixedParagraphWithClasses} | ${false}                           | ${""}
  `(
    "[$#] should provide expected result for pattern matching classes: $element matches $pattern = $expectedMatch $comment",
    ({
      pattern,
      element,
      expectedMatch,
    }: {
      pattern: ElementMatcherPattern;
      element: Element;
      expectedMatch: ReturnType<ElementPredicate>;
    }) => {
      const compiled = compileElementMatcherPattern(pattern);
      if (!expectedMatch) {
        expect(compiled(element)).toStrictEqual(false);
      } else {
        // Not strict here, as we don't want to check for undefined entries.
        expect(compiled(element)).toEqual(expectedMatch);
      }
    }
  );

  it.each`
    pattern                                                                | element                     | expectedMatch
    ${{ name: "p", classes: "lorem" }}                                     | ${htmlParagraphWithClasses} | ${{ name: matchedName(htmlParagraphWithClasses), classes: ["lorem"] }}
    ${{ name: "p", classes: ["lorem", "ipsum"] }}                          | ${htmlParagraphWithClasses} | ${{ name: matchedName(htmlParagraphWithClasses), classes: ["lorem", "ipsum"] }}
    ${{ name: "p", classes: "dolor" }}                                     | ${htmlParagraphWithClasses} | ${false}
    ${{ name: "p", classes: ["lorem", "dolor"] }}                          | ${htmlParagraphWithClasses} | ${false}
    ${{ name: "p", classes: "lorem" }}                                     | ${rtParagraphWithClasses}   | ${{ name: matchedName(rtParagraphWithClasses), classes: ["lorem"] }}
    ${{ name: "p", classes: ["lorem", "ipsum"] }}                          | ${rtParagraphWithClasses}   | ${{ name: matchedName(rtParagraphWithClasses), classes: ["lorem", "ipsum"] }}
    ${{ name: { namespaceURI: dataNs }, classes: "lorem" }}                | ${rtParagraphWithClasses}   | ${{ name: matchedName(rtParagraphWithClasses), classes: ["lorem"] }}
    ${{ name: { namespaceURI: dataNs }, classes: ["lorem", "ipsum"] }}     | ${rtParagraphWithClasses}   | ${{ name: matchedName(rtParagraphWithClasses), classes: ["lorem", "ipsum"] }}
    ${{ name: "p", classes: "dolor" }}                                     | ${rtParagraphWithClasses}   | ${false}
    ${{ name: "p", classes: ["lorem", "dolor"] }}                          | ${rtParagraphWithClasses}   | ${false}
    ${{ name: "span", classes: "lorem" }}                                  | ${htmlParagraphWithClasses} | ${false}
    ${{ name: "span", classes: ["lorem", "ipsum"] }}                       | ${htmlParagraphWithClasses} | ${false}
    ${{ name: { namespaceURI: dataViewNs }, classes: "lorem" }}            | ${rtParagraphWithClasses}   | ${false}
    ${{ name: { namespaceURI: dataViewNs }, classes: ["lorem", "ipsum"] }} | ${rtParagraphWithClasses}   | ${false}
  `(
    "[$#] should provide expected result for pattern matching classes and name: $element matches $pattern = $expectedMatch",
    ({
      pattern,
      element,
      expectedMatch,
    }: {
      pattern: ElementMatcherPattern;
      element: Element;
      expectedMatch: ReturnType<ElementPredicate>;
    }) => {
      const compiled = compileElementMatcherPattern(pattern);
      if (!expectedMatch) {
        expect(compiled(element)).toStrictEqual(false);
      } else {
        // Not strict here, as we don't want to check for undefined entries.
        expect(compiled(element)).toEqual(expectedMatch);
      }
    }
  );
});
