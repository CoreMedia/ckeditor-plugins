/**
 * While `MatcherPattern` has a rich set of possible types for the
 * `arguments` entry, we are especially interested in allowing or disallowing
 * an attribute and to possibly restrict its value to a set of values
 * defined by the DTD. Such as the `dir` attribute may only hold values
 * `ltr` and `rtl`.
 */
type AttributesType = Record<string, string | RegExp | boolean | number>;

/**
 * While the `MatcherPattern` is rather complex, we only want to support a
 * subset in this configuration, which eases merging patterns a lot.
 */
interface ReducedMatcherPattern {
  name?: string | RegExp;
  /**
   * While `MatcherPattern` allows for example defining a regular expression for
   * matching classes, we are only interested in allowing or disallowing classes
   * in general in the context of General RichText Support (GRS).
   */
  classes?: boolean;
  attributes?: AttributesType;
}

/**
 * A `MatcherPattern` which inherits from an already existing matcher
 * pattern by name reference in `inherit`.
 */
interface InheritingMatcherPattern extends ReducedMatcherPattern {
  /**
   * Name of pattern to inherit. For existing patterns with regular expressions,
   * this string will be matched towards this regular expression.
   *
   * If unset, this pattern is assumed to be a new pattern without
   * any inheritance.
   */
  inherit?: string;
}

/**
 * Merges MatcherPatterns (of specific object type). `classes` of the resulting
 * pattern will be `true` if any of the patterns sets `classes` to `true`.
 * For `name` and nested `attributes` patterns later in the list may override
 * previously defined definitions. Thus, merging
 * `[{ name: "a" }, { name: "b" }]` will result in pattern `{ name: "b" }`.
 *
 * @param sources - sources to merge
 */
const mergePatterns = (...sources: ReducedMatcherPattern[]): ReducedMatcherPattern => {
  const result: ReducedMatcherPattern = {};
  const supportsClasses = sources.find((s) => s.classes === true);
  if (supportsClasses) {
    result.classes = true;
  }
  sources.forEach((s) => {
    if (s.name) {
      // Will override any previously defined name.
      result.name = s.name;
    }
    if (s.attributes) {
      result.attributes = result.attributes ?? {};
      for (const key in s.attributes) {
        result.attributes[key] = s.attributes[key];
      }
    }
  });
  return result;
};

/**
 * Finds the first pattern, which matches the given name (either by string
 * equality or pattern match). Patterns without names are ignored during lookup.
 *
 * @param name - name to find
 * @param patterns - patterns to search in
 * @returns pattern found; `undefined` for no pattern found
 */
const findFirstPattern = (name: string, ...patterns: ReducedMatcherPattern[]): ReducedMatcherPattern | undefined => {
  for (const pattern of patterns) {
    const currentName = pattern.name;
    if (!currentName) {
      continue;
    }
    if (typeof currentName === "string") {
      if (name === currentName) {
        return pattern;
      }
    } else {
      if (currentName.test(name)) {
        return pattern;
      }
    }
  }
  return undefined;
};

/**
 * Strategy to lookup existing matcher patterns. Returns `undefined`, if no
 * matcher pattern has been found.
 */
type MatcherPatternLookup = (name: string) => ReducedMatcherPattern | undefined;

/**
 * Transforms the array of patterns to a lookup-strategy by pattern name.
 *
 * @param patterns - patterns to search within
 */
const toLookupStrategy =
  (...patterns: ReducedMatcherPattern[]): MatcherPatternLookup =>
  (name) =>
    findFirstPattern(name, ...patterns);

/**
 * Resolves an inheriting pattern.
 *
 * @param pattern - pattern to resolve
 * @param lookup - strategy or list of patterns to lookup existing matcher patterns to inherit
 */
const resolveInheritance = (
  pattern: InheritingMatcherPattern,
  lookup: MatcherPatternLookup | ReducedMatcherPattern[]
): ReducedMatcherPattern => {
  const strategy = typeof lookup === "function" ? lookup : toLookupStrategy(...lookup);
  const { inherit, ...rest } = pattern;

  if (!inherit) {
    // We may just return pattern here, but this way, we ensure, that for example
    // even an empty string is inheritance is ignored, but does not make it into
    // the result.
    return rest;
  }

  const inherited = strategy(inherit);

  if (!inherited) {
    throw new Error(`Failed resolving alias for '${pattern.inherit}'.`);
  }

  // Merging will ignore the (now obsolete) `inherit` attribute.
  return mergePatterns(inherited, pattern);
};

export default ReducedMatcherPattern;
export {
  AttributesType,
  InheritingMatcherPattern,
  MatcherPatternLookup,
  findFirstPattern,
  mergePatterns,
  resolveInheritance,
  toLookupStrategy,
};
