import "global-jsdom/register";
import test, { describe } from "node:test";
import expect from "expect";
import type { AttributesType, InheritingMatcherPattern } from "../src/ReducedMatcherPattern";
import type ReducedMatcherPattern from "../src/ReducedMatcherPattern";
import { findFirstPattern, mergePatterns, resolveInheritance, toLookupStrategy } from "../src/ReducedMatcherPattern";

/**
 * Abbreviated form of `ReducedMatcherPattern` to ease providing data for tests.
 */
interface AbbreviatedPattern {
  /**
   * Represents the name.
   */
  n?: string | RegExp;
  /**
   * Represents the classes.
   */
  c?: boolean;
  /**
   * Signals attributes to allow. Use `attr=value` to allow only one value.
   */
  a?: string;
}

/**
 * Inflates the abbreviated pattern to a full `ReducedMatcherPattern`.
 *
 * @param abbrev - abbreviation to inflate
 */
const inflate = (abbrev: AbbreviatedPattern | undefined): ReducedMatcherPattern | undefined => {
  if (abbrev === undefined) {
    return undefined;
  }
  const result: ReducedMatcherPattern = {};
  if (abbrev.n !== undefined) {
    result.name = abbrev.n;
  }
  if (abbrev.c !== undefined) {
    result.classes = abbrev.c;
  }
  if (abbrev.a !== undefined) {
    const attrs: AttributesType = {};
    const list = abbrev.a.split(",");
    list.forEach((attr) => {
      const parts = attr.split("=");
      if (parts.length > 1) {
        attrs[parts[0]] = parts[1];
      } else {
        attrs[attr] = true;
      }
    });
    result.attributes = attrs;
  }
  return result;
};

/**
 * Type Guard to remove undefined entries (and have correct type afterward).
 *
 * @param pattern - pattern to validate
 */
const isReducedMatcherPattern = (pattern: ReducedMatcherPattern | undefined): pattern is ReducedMatcherPattern =>
  !!pattern;

void describe("ReducedMatcherPattern", () => {
  void describe("mergePatterns", () => {
    void test("should accept empty array", () => {
      const actual = mergePatterns();
      const expected: ReducedMatcherPattern = {};
      expect(actual).toStrictEqual(expected);
    });

    const testCases = [
      {
        category: "all",
        p1: {},
        p2: {},
        p3: {},
        expected: {},
        comment: "don't set any attribute if all are unset",
      },
      {
        category: "all",
        p1: { a: "a" },
        p2: { n: "b" },
        p3: { c: true },
        expected: { n: "b", a: "a", c: true },
        comment: "merge attributes",
      },
      {
        category: "classes",
        p1: { c: true },
        p2: {},
        p3: {},
        expected: { c: true },
        comment: "irrelevant order",
      },
      {
        category: "classes",
        p1: {},
        p2: { c: true },
        p3: {},
        expected: { c: true },
        comment: "irrelevant order",
      },
      {
        category: "classes",
        p1: {},
        p2: {},
        p3: { c: true },
        expected: { c: true },
        comment: "irrelevant order",
      },
      {
        category: "classes",
        p1: { c: true },
        p2: undefined,
        p3: undefined,
        expected: { c: true },
        comment: "works for one entry",
      },
      {
        category: "classes",
        p1: { c: false },
        p2: { c: true },
        p3: {},
        expected: { c: true },
        comment: "treat undefined and false as same (there is no veto)",
      },
      {
        category: "classes",
        p1: {},
        p2: { c: true },
        p3: { c: false },
        expected: { c: true },
        comment: "treat undefined and false as same (there is no veto)",
      },
      {
        category: "name",
        p1: { n: "#1" },
        p2: {},
        p3: {},
        expected: { n: "#1" },
        comment: "last wins",
      },
      {
        category: "name",
        p1: {},
        p2: { n: "#2" },
        p3: {},
        expected: { n: "#2" },
        comment: "last wins",
      },
      {
        category: "name",
        p1: {},
        p2: {},
        p3: { n: "#3" },
        expected: { n: "#3" },
        comment: "last wins",
      },
      {
        category: "name",
        p1: { n: "#1" },
        p2: { n: "#2" },
        p3: { n: "#3" },
        expected: { n: "#3" },
        comment: "last wins",
      },
      {
        category: "attributes",
        p1: { a: "a" },
        p2: {},
        p3: {},
        expected: { a: "a" },
        comment: "handle attributes",
      },
      {
        category: "attributes",
        p1: {},
        p2: { a: "b" },
        p3: {},
        expected: { a: "b" },
        comment: "handle attributes",
      },
      {
        category: "attributes",
        p1: {},
        p2: {},
        p3: { a: "c" },
        expected: { a: "c" },
        comment: "handle attributes",
      },
      {
        category: "attributes",
        p1: { a: "a" },
        p2: { a: "b" },
        p3: { a: "c" },
        expected: { a: "a,b,c" },
        comment: "merge attributes",
      },
      {
        category: "attributes",
        p1: { a: "a=a" },
        p2: { a: "a=b" },
        p3: { a: "a=c" },
        expected: { a: "a=c" },
        comment: "last wins",
      },
    ];

    void describe("mergePatterns()", () => {
      for (const [i, { category, p1, p2, p3, expected, comment }] of testCases.entries()) {
        void test(`[${i}] ${category} - should merge to ${JSON.stringify(expected)} for: [p1, p2, p3] = [${JSON.stringify(p1)}, ${JSON.stringify(p2)}, ${JSON.stringify(p3)}] - ${comment}`, () => {
          const pattern1 = inflate(p1);
          const pattern2 = inflate(p2);
          const pattern3 = inflate(p3);
          const patterns = [pattern1, pattern2, pattern3].filter(isReducedMatcherPattern);
          const iExpected = inflate(expected);

          const actual = mergePatterns(...patterns);

          expect(actual).toStrictEqual(iExpected);
        });
      }
    });
  });

  void describe("findFirstPattern", () => {
    void test("should accept empty array", () => {
      const actual = findFirstPattern("any");
      expect(actual).toBeUndefined();
    });

    const testCases = [
      {
        name: "a",
        p1: { n: "a", a: "a" },
        p2: { n: "a", a: "b" },
        expected: { n: "a", a: "a" },
        comment: "search in string names",
      },
      {
        name: "b",
        p1: { n: "a" },
        p2: { n: "b" },
        expected: { n: "b" },
        comment: "search in string names",
      },
      {
        name: "c",
        p1: { n: "a" },
        p2: { n: "b" },
        expected: undefined,
        comment: "not found in string names",
      },
      {
        name: "a",
        p1: { n: "a" },
        p2: undefined,
        expected: { n: "a" },
        comment: "one element only to search in",
      },
      {
        name: "a",
        p1: { n: /a/, a: "a" },
        p2: { n: /a/, a: "b" },
        expected: { n: /a/, a: "a" },
        comment: "search in pattern names",
      },
      {
        name: "b",
        p1: { n: /a/ },
        p2: { n: /b/ },
        expected: { n: /b/ },
        comment: "search in pattern names",
      },
      {
        name: "c",
        p1: { n: /a/ },
        p2: { n: /b/ },
        expected: undefined,
        comment: "not found in pattern names",
      },
      {
        name: "a",
        p1: { n: /a/, a: "a" },
        p2: { n: "a", a: "b" },
        expected: { n: /a/, a: "a" },
        comment: "search in mixed names, first matches",
      },
      {
        name: "a",
        p1: { n: "a", a: "a" },
        p2: { n: /a/, a: "b" },
        expected: { n: "a", a: "a" },
        comment: "search in mixed names, first matches",
      },
      {
        name: "b",
        p1: { n: /a/ },
        p2: { n: "b" },
        expected: { n: "b" },
        comment: "search in mixed names, second matches",
      },
      {
        name: "b",
        p1: { n: "a" },
        p2: { n: /b/ },
        expected: { n: /b/ },
        comment: "search in mixed names, second matches",
      },
    ];

    void describe("findFirstPattern()", () => {
      for (const [i, { name, p1, p2, expected, comment }] of testCases.entries()) {
        void test(`[${i}] find first named ${name} in [${JSON.stringify(p1)}, ${JSON.stringify(p2)}] = ${JSON.stringify(expected)} - ${comment}`, () => {
          const pattern1 = inflate(p1);
          const pattern2 = inflate(p2);
          const patterns = [pattern1, pattern2].filter(isReducedMatcherPattern);
          const iExpected = inflate(expected);

          const actual = findFirstPattern(name, ...patterns);

          expect(actual).toStrictEqual(iExpected);
        });
      }
    });
  });

  const testCases = [
    {
      name: "a",
      p1: { n: "a", a: "a" },
      p2: { n: "a", a: "b" },
      expected: { n: "a", a: "a" },
      comment: "search in string names",
    },
    {
      name: "a",
      p1: { n: /a/, a: "a" },
      p2: { n: /a/, a: "b" },
      expected: { n: /a/, a: "a" },
      comment: "search in pattern names",
    },
    {
      name: "b",
      p1: { n: /a/ },
      p2: { n: /b/ },
      expected: { n: /b/ },
      comment: "search in pattern names",
    },
    {
      name: "a",
      p1: { n: /a/, a: "a" },
      p2: { n: "a", a: "b" },
      expected: { n: /a/, a: "a" },
      comment: "search in mixed names, first matches",
    },
    {
      name: "b",
      p1: { n: "a" },
      p2: { n: /b/ },
      expected: { n: /b/ },
      comment: "search in mixed names, second matches",
    },
  ];

  void describe("toLookupStrategy()", () => {
    for (const [i, { name, p1, p2, expected, comment }] of testCases.entries()) {
      void test(`[${i}] find first named ${name} in [${JSON.stringify(p1)}, ${JSON.stringify(p2)}] = ${JSON.stringify(expected)} - ${comment}`, () => {
        const pattern1 = inflate(p1);
        const pattern2 = inflate(p2);
        const patterns = [pattern1, pattern2].filter(isReducedMatcherPattern);
        const iExpected = inflate(expected);
        const strategy = toLookupStrategy(...patterns);

        const actual = strategy(name);

        expect(actual).toStrictEqual(iExpected);
      });
    }
  });

  void describe("resolveInheritance", () => {
    const deflatedPatterns: AbbreviatedPattern[] = [
      {
        n: "first",
        a: "first",
      },
      {
        n: "second",
        a: "second",
        c: true,
      },
    ];
    const existingPatterns: ReducedMatcherPattern[] = deflatedPatterns.map(inflate).filter(isReducedMatcherPattern);
    const strategy = toLookupStrategy(...existingPatterns);

    void test("should use provided lookup strategy", () => {
      const pattern: InheritingMatcherPattern = {
        name: "custom",
        inherit: "first",
      };
      const expectedDeflated: AbbreviatedPattern = {
        n: "custom",
        a: "first",
      };
      const expected = inflate(expectedDeflated);

      const actual = resolveInheritance(pattern, strategy);

      expect(actual).toStrictEqual(expected);
    });

    void test("should dynamically create lookup strategy from existing patterns", () => {
      const pattern: InheritingMatcherPattern = {
        name: "custom",
        inherit: "first",
      };
      const expectedDeflated: AbbreviatedPattern = {
        n: "custom",
        a: "first",
      };
      const expected = inflate(expectedDeflated);

      const actual = resolveInheritance(pattern, existingPatterns);

      expect(actual).toStrictEqual(expected);
    });

    void test("should use apply attributes from inherited pattern", () => {
      const pattern: InheritingMatcherPattern = {
        name: "custom",
        inherit: "second",
      };
      const expectedDeflated: AbbreviatedPattern = {
        n: "custom",
        a: "second",
        c: true,
      };
      const expected = inflate(expectedDeflated);

      const actual = resolveInheritance(pattern, strategy);

      expect(actual).toStrictEqual(expected);
    });

    void test("should fail, if inherited target not found", () => {
      const pattern: InheritingMatcherPattern = {
        name: "custom",
        inherit: "not-existing",
      };
      const failing = (): void => {
        resolveInheritance(pattern, strategy);
      };
      expect(failing).toThrow(Error);
    });

    void test("convenience: should accept patterns without inheritance, deleting empty inherit", () => {
      const pattern: InheritingMatcherPattern = {
        name: "custom",
        inherit: "",
        classes: true,
      };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { inherit, ...expected } = pattern;

      const actual = resolveInheritance(pattern, strategy);

      expect(actual).toStrictEqual(expected);
    });

    void test("convenience: should accept patterns without inheritance", () => {
      const pattern: InheritingMatcherPattern = {
        name: "custom",
        classes: true,
      };

      const actual = resolveInheritance(pattern, strategy);

      expect(actual).toStrictEqual(pattern);
    });
  });
});
