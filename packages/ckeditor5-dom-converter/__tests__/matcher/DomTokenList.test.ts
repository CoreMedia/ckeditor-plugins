import { element, html, select } from "../ElementUtils";
import { compileDomTokenListMatcherPattern } from "../../src/matcher/DomTokenList";

const fixture = element(html(`<div><p class="lorem ipsum"/></div>`), select("p"));
const tokenList = fixture.classList;

describe("matcher.DomTokenList", () => {
  describe("compileDomTokenListMatcherPattern", () => {
    it("should match just all class list tokens on tautological always true match", () => {
      const compiled = compileDomTokenListMatcherPattern(true);
      const result = compiled(tokenList);
      if (result === false) {
        fail("Result is unexpectedly false.");
      }
      expect(result.sort()).toStrictEqual(["ipsum", "lorem"]);
    });

    it.each`
      pattern          | expected
      ${"lorem"}       | ${["lorem"]}
      ${"ipsum"}       | ${["ipsum"]}
      ${"lorem ipsum"} | ${false}
      ${"dolor"}       | ${false}
    `(
      "[$#] should result in $expected for string pattern: $pattern",
      ({ pattern, expected }: { pattern: string; expected: false | string[] }) => {
        const compiled = compileDomTokenListMatcherPattern(pattern);
        const result = compiled(tokenList);
        const sortedResult = result === false ? false : result.sort();
        const sortedExpected = expected === false ? false : expected.sort();
        expect(sortedResult).toStrictEqual(sortedExpected);
      }
    );

    it.each`
      pattern              | expected
      ${/^lorem$/}         | ${["lorem"]}
      ${/^ipsum$/}         | ${["ipsum"]}
      ${/^(lorem|ipsum)$/} | ${["lorem", "ipsum"]}
      ${/.*/}              | ${["lorem", "ipsum"]}
      ${/^lorem ipsum/}    | ${false}
      ${/^dolor$/}         | ${false}
    `(
      "[$#] should result in $expected for regular expression: $pattern",
      ({ pattern, expected }: { pattern: RegExp; expected: false | string[] }) => {
        const compiled = compileDomTokenListMatcherPattern(pattern);
        const result = compiled(tokenList);
        const sortedResult = result === false ? false : result.sort();
        const sortedExpected = expected === false ? false : expected.sort();
        expect(sortedResult).toStrictEqual(sortedExpected);
      }
    );

    it.each`
      pattern                           | expected
      ${{}}                             | ${[]}
      ${{ lorem: true }}                | ${["lorem"]}
      ${{ ipsum: true }}                | ${["ipsum"]}
      ${{ lorem: true, ipsum: true }}   | ${["lorem", "ipsum"]}
      ${{ lorem: true, dolor: false }}  | ${["lorem"]}
      ${{ dolor: true }}                | ${false}
      ${{ lorem: true, dolor: true }}   | ${false}
      ${{ lorem: false, dolor: false }} | ${false}
      ${{ lorem: false }}               | ${false}
    `(
      "[$#] should result in $expected for record pattern: $pattern",
      ({ pattern, expected }: { pattern: Record<string, boolean>; expected: false | string[] }) => {
        const compiled = compileDomTokenListMatcherPattern(pattern);
        const result = compiled(tokenList);
        const sortedResult = result === false ? false : result.sort();
        const sortedExpected = expected === false ? false : expected.sort();
        expect(sortedResult).toStrictEqual(sortedExpected);
      }
    );

    it.each`
      pattern    | expected
      ${"lorem"} | ${["lorem"]}
      ${"dolor"} | ${false}
    `(
      "[$#] should result in $expected for compiled string pattern: $pattern",
      ({ pattern, expected }: { pattern: string; expected: false | string[] }) => {
        const intermediateCompiled = compileDomTokenListMatcherPattern(pattern);
        const compiled = compileDomTokenListMatcherPattern(intermediateCompiled);
        const result = compiled(tokenList);
        const sortedResult = result === false ? false : result.sort();
        const sortedExpected = expected === false ? false : expected.sort();
        expect(sortedResult).toStrictEqual(sortedExpected);
      }
    );
  });
});
