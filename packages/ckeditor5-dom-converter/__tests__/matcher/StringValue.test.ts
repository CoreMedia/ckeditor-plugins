import {
  compileNullableStringValueMatcherPattern,
  compileStringValueMatcherPattern,
} from "../../src/matcher/StringValue";

describe("matcher.StringValue", () => {
  // =======================================[ compileStringValueMatcherPattern ]

  describe("compileStringValueMatcherPattern", () => {
    it("should compile representation as string to strict equals predicate", () => {
      const compiled = compileStringValueMatcherPattern("lorem");
      expect(compiled).toBeDefined();
      expect(compiled("lorem")).toStrictEqual(true);
      expect(compiled("ipsum")).toStrictEqual(false);
    });

    it("should compile representation as regular expression to match predicate", () => {
      const compiled = compileStringValueMatcherPattern(/^lorem$/);
      expect(compiled).toBeDefined();
      expect(compiled("lorem")).toStrictEqual(true);
      expect(compiled("ipsum")).toStrictEqual(false);
    });

    it("should compile representation as predicate as is", () => {
      const predicate = compileStringValueMatcherPattern("lorem");
      const compiled = compileStringValueMatcherPattern(predicate);
      expect(compiled).toBeDefined();
      expect(compiled("lorem")).toStrictEqual(true);
      expect(compiled("ipsum")).toStrictEqual(false);
    });
  });

  // ===============================[ compileNullableStringValueMatcherPattern ]

  describe("compileNullableStringValueMatcherPattern", () => {
    it("should compile representation null to strict equals predicate", () => {
      const compiled = compileNullableStringValueMatcherPattern(null);
      expect(compiled).toBeDefined();
      expect(compiled(null)).toStrictEqual(true);
      expect(compiled("lorem")).toStrictEqual(false);
    });

    it("should compile representation as string to strict equals predicate", () => {
      const compiled = compileNullableStringValueMatcherPattern("lorem");
      expect(compiled).toBeDefined();
      expect(compiled("lorem")).toStrictEqual(true);
      expect(compiled("ipsum")).toStrictEqual(false);
      expect(compiled(null)).toStrictEqual(false);
    });

    it("should compile representation as regular expression to match predicate", () => {
      const compiled = compileNullableStringValueMatcherPattern(/^lorem$/);
      expect(compiled).toBeDefined();
      expect(compiled("lorem")).toStrictEqual(true);
      expect(compiled("ipsum")).toStrictEqual(false);
      expect(compiled(null)).toStrictEqual(false);
    });

    it("should compile representation as predicate as is", () => {
      const predicate = compileNullableStringValueMatcherPattern("lorem");
      const compiled = compileNullableStringValueMatcherPattern(predicate);
      expect(compiled).toBeDefined();
      expect(compiled("lorem")).toStrictEqual(true);
      expect(compiled("ipsum")).toStrictEqual(false);
      expect(compiled(null)).toStrictEqual(false);
    });
  });
});
