import ReducedMatcherPattern, {
  AttributesType,
  findFirstPattern,
  InheritingMatcherPattern,
  mergePatterns,
  resolveInheritance,
  toLookupStrategy,
} from "../src/ReducedMatcherPattern";

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
 * Type Guard to remove undefined entries (and have correct type afterwards).
 *
 * @param pattern - pattern to validate
 */
const isReducedMatcherPattern = (pattern: ReducedMatcherPattern | undefined): pattern is ReducedMatcherPattern =>
  !!pattern;

describe("ReducedMatcherPattern", () => {
  describe("mergePatterns", () => {
    it("should accept empty array", () => {
      const actual = mergePatterns();
      const expected: ReducedMatcherPattern = {};
      expect(actual).toStrictEqual(expected);
    });

    it.each`
      category        | p1              | p2              | p3              | expected                       | comment
      ${"all"}        | ${{}}           | ${{}}           | ${{}}           | ${{}}                          | ${"don't set any attribute if all are unset"}
      ${"all"}        | ${{ a: "a" }}   | ${{ n: "b" }}   | ${{ c: true }}  | ${{ n: "b", a: "a", c: true }} | ${"merge attributes"}
      ${"classes"}    | ${{ c: true }}  | ${{}}           | ${{}}           | ${{ c: true }}                 | ${"irrelevant order"}
      ${"classes"}    | ${{}}           | ${{ c: true }}  | ${{}}           | ${{ c: true }}                 | ${"irrelevant order"}
      ${"classes"}    | ${{}}           | ${{}}           | ${{ c: true }}  | ${{ c: true }}                 | ${"irrelevant order"}
      ${"classes"}    | ${{ c: true }}  | ${undefined}    | ${undefined}    | ${{ c: true }}                 | ${"works for one entry"}
      ${"classes"}    | ${{ c: false }} | ${{ c: true }}  | ${{}}           | ${{ c: true }}                 | ${"treat undefined and false as same (there is no veto)"}
      ${"classes"}    | ${{}}           | ${{ c: true }}  | ${{ c: false }} | ${{ c: true }}                 | ${"treat undefined and false as same (there is no veto)"}
      ${"name"}       | ${{ n: "#1" }}  | ${{}}           | ${{}}           | ${{ n: "#1" }}                 | ${"last wins"}
      ${"name"}       | ${{}}           | ${{ n: "#2" }}  | ${{}}           | ${{ n: "#2" }}                 | ${"last wins"}
      ${"name"}       | ${{}}           | ${{}}           | ${{ n: "#3" }}  | ${{ n: "#3" }}                 | ${"last wins"}
      ${"name"}       | ${{ n: "#1" }}  | ${{ n: "#2" }}  | ${{ n: "#3" }}  | ${{ n: "#3" }}                 | ${"last wins"}
      ${"attributes"} | ${{ a: "a" }}   | ${{}}           | ${{}}           | ${{ a: "a" }}                  | ${"handle attributes"}
      ${"attributes"} | ${{}}           | ${{ a: "b" }}   | ${{}}           | ${{ a: "b" }}                  | ${"handle attributes"}
      ${"attributes"} | ${{}}           | ${{}}           | ${{ a: "c" }}   | ${{ a: "c" }}                  | ${"handle attributes"}
      ${"attributes"} | ${{ a: "a" }}   | ${{ a: "b" }}   | ${{ a: "c" }}   | ${{ a: "a,b,c" }}              | ${"merge attributes"}
      ${"attributes"} | ${{ a: "a=a" }} | ${{ a: "a=b" }} | ${{ a: "a=c" }} | ${{ a: "a=c" }}                | ${"last wins"}
    `(
      "[$#] $category - should merge to $expected for: [p1, p2, p3] = [$p1, $p2, $p3] - $comment",
      ({ p1, p2, p3, expected }) => {
        const pattern1 = inflate(p1);
        const pattern2 = inflate(p2);
        const pattern3 = inflate(p3);
        const patterns: ReducedMatcherPattern[] = [pattern1, pattern2, pattern3].filter(isReducedMatcherPattern);
        const iExpected = inflate(expected);

        const actual = mergePatterns(...patterns);

        expect(actual).toStrictEqual(iExpected);
      },
    );
  });

  describe("findFirstPattern", () => {
    it("should accept empty array", () => {
      const actual = findFirstPattern("any");
      expect(actual).toBeUndefined();
    });

    it.each`
      name   | p1                    | p2                    | expected              | comment
      ${"a"} | ${{ n: "a", a: "a" }} | ${{ n: "a", a: "b" }} | ${{ n: "a", a: "a" }} | ${"search in string names"}
      ${"b"} | ${{ n: "a" }}         | ${{ n: "b" }}         | ${{ n: "b" }}         | ${"search in string names"}
      ${"c"} | ${{ n: "a" }}         | ${{ n: "b" }}         | ${undefined}          | ${"not found in string names"}
      ${"a"} | ${{ n: "a" }}         | ${undefined}          | ${{ n: "a" }}         | ${"one element only to search in"}
      ${"a"} | ${{ n: /a/, a: "a" }} | ${{ n: /a/, a: "b" }} | ${{ n: /a/, a: "a" }} | ${"search in pattern names"}
      ${"b"} | ${{ n: /a/ }}         | ${{ n: /b/ }}         | ${{ n: /b/ }}         | ${"search in pattern names"}
      ${"c"} | ${{ n: /a/ }}         | ${{ n: /b/ }}         | ${undefined}          | ${"not found in pattern names"}
      ${"a"} | ${{ n: /a/, a: "a" }} | ${{ n: "a", a: "b" }} | ${{ n: /a/, a: "a" }} | ${"search in mixed names, first matches"}
      ${"a"} | ${{ n: "a", a: "a" }} | ${{ n: /a/, a: "b" }} | ${{ n: "a", a: "a" }} | ${"search in mixed names, first matches"}
      ${"b"} | ${{ n: /a/ }}         | ${{ n: "b" }}         | ${{ n: "b" }}         | ${"search in mixed names, second matches"}
      ${"b"} | ${{ n: "a" }}         | ${{ n: /b/ }}         | ${{ n: /b/ }}         | ${"search in mixed names, second matches"}
    `("[$#] find first named $name in [$p1, $p2] = $expected", ({ name, p1, p2, expected }) => {
      const pattern1 = inflate(p1);
      const pattern2 = inflate(p2);
      const patterns: ReducedMatcherPattern[] = [pattern1, pattern2].filter(isReducedMatcherPattern);
      const iExpected = inflate(expected);

      const actual = findFirstPattern(name, ...patterns);

      expect(actual).toStrictEqual(iExpected);
    });
  });

  describe("toLookupStrategy", () => {
    // Reduced test set from `findFirstPattern` just to ensure it works in general.
    it.each`
      name   | p1                    | p2                    | expected              | comment
      ${"a"} | ${{ n: "a", a: "a" }} | ${{ n: "a", a: "b" }} | ${{ n: "a", a: "a" }} | ${"search in string names"}
      ${"a"} | ${{ n: /a/, a: "a" }} | ${{ n: /a/, a: "b" }} | ${{ n: /a/, a: "a" }} | ${"search in pattern names"}
      ${"b"} | ${{ n: /a/ }}         | ${{ n: /b/ }}         | ${{ n: /b/ }}         | ${"search in pattern names"}
      ${"a"} | ${{ n: /a/, a: "a" }} | ${{ n: "a", a: "b" }} | ${{ n: /a/, a: "a" }} | ${"search in mixed names, first matches"}
      ${"b"} | ${{ n: "a" }}         | ${{ n: /b/ }}         | ${{ n: /b/ }}         | ${"search in mixed names, second matches"}
    `("[$#] find first named $name in [$p1, $p2] = $expected", ({ name, p1, p2, expected }) => {
      const pattern1 = inflate(p1);
      const pattern2 = inflate(p2);
      const patterns: ReducedMatcherPattern[] = [pattern1, pattern2].filter(isReducedMatcherPattern);
      const iExpected = inflate(expected);
      const strategy = toLookupStrategy(...patterns);

      const actual = strategy(name);

      expect(actual).toStrictEqual(iExpected);
    });
  });

  describe("resolveInheritance", () => {
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

    it("should use provided lookup strategy", () => {
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

    it("should dynamically create lookup strategy from existing patterns", () => {
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

    it("should use apply attributes from inherited pattern", () => {
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

    it("should fail, if inherited target not found", () => {
      const pattern: InheritingMatcherPattern = {
        name: "custom",
        inherit: "not-existing",
      };
      const failing = (): void => {
        resolveInheritance(pattern, strategy);
      };
      expect(failing).toThrowError();
    });

    it("convenience: should accept patterns without inheritance, deleting empty inherit", () => {
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

    it("convenience: should accept patterns without inheritance", () => {
      const pattern: InheritingMatcherPattern = {
        name: "custom",
        classes: true,
      };

      const actual = resolveInheritance(pattern, strategy);

      expect(actual).toStrictEqual(pattern);
    });
  });
});
