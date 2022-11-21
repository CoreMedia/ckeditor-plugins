/**
 * Predicate to match a given `DOMTokenList`. `false` signals no match, while
 * on match, all positively matched tokens will be returned.
 *
 * @param value - token list to validate
 */
export type DomTokenListPredicate = (value: DOMTokenList) => false | string[];

/**
 * Pattern to match a given `DOMTokenList`.
 *
 * * `true` always match; result will contain all tokens.
 * * `string` must match at least one element; result contains all matched tokens
 * * `string[]` all tokens must be contained; result contains all matched tokens
 * * `RegExp` must match at least one element; result contains all matched tokens
 * * `Record` all `true` states must be contained, all `false` tokens must not be contained; result contains all positively matched tokens
 * * `DomTokenListPredicate` predicate to match tokens
 */
export type DomTokenListMatcherPattern = true | string | string[] | RegExp | Record<string, boolean> | DomTokenListPredicate;

/**
 * Compiles the given pattern for a `DOMTokenList` to a predicate.
 *
 * @param pattern - pattern to compile
 */
export const compileDomTokenListMatcherPattern = (pattern: DomTokenListMatcherPattern): DomTokenListPredicate => {
  if (pattern === true) {
    return (value) => Array.from(value);
  }
  if (typeof pattern === "string") {
    return (value) => (value.contains(pattern) ? [pattern] : false);
  }
  if (Array.isArray(pattern)) {
    return (value) => {
      for (const token of pattern) {
        if (!value.contains(token)) {
          return false;
        }
      }
      return pattern;
    };
  }
  if (pattern instanceof RegExp) {
    return (value): false | string[] => {
      const matched = Array.from<string>(value).filter((token) => pattern.test(token));
      if (matched.length === 0) {
        return false;
      }
      return matched;
    };
  }
  if (typeof pattern === "object") {
    return (value): false | string[] => {
      const positiveMatches: string[] = [];
      for (const [token, expected] of Object.entries(pattern)) {
        if (expected) {
          if (value.contains(token)) {
            positiveMatches.push(token);
          } else {
            return false;
          }
        } else {
          if (value.contains(token)) {
            return false;
          }
        }
      }
      // Note that for an empty record we signal a match, but don't return any
      // matched entries. Alternatively, we may consider returning just all
      // entries for a tautological match.
      return positiveMatches;
    };
  }
  return pattern;
};

/**
 * Applies the given predicate, if any, to the given `DOMTokenList`.
 *
 * Possibly returned values are:
 *
 * * `undefined` iff. the predicate is undefined
 * * `false` iff. the predicate is defined but does not signal a match
 * * details of matched tokens on match
 *
 * @param value - token list to validate
 * @param predicate - optional predicate to use
 */
export const possiblyMatchDomTokenList = (
  value: DOMTokenList,
  predicate?: DomTokenListPredicate
): undefined | ReturnType<DomTokenListPredicate> => {
  if (predicate) {
    return predicate(value);
  }
  return undefined;
};
