/**
 * Predicate for a string value.
 */
export type StringValuePredicate = (value: string) => boolean;

/**
 * Predicate for a nullable string value.
 */
export type NullableStringValuePredicate = (value: string | null) => boolean;

/**
 * Pattern for a string value.
 *
 * * `string` to strictly equal string value
 * * `RegExp` to test string value via regular expression
 * * `StringValuePredicate` to validate string by predicate
 */
export type StringValueMatcherPattern = string | RegExp | StringValuePredicate;

/**
 * Pattern for a nullable string value.
 *
 * * `null` to explicitly check for the value being `null`
 * * `string` to strictly equal string value
 * * `RegExp` to test string value via regular expression
 * * `NullableStringValuePredicate` to validate string by predicate
 */
export type NullableStringValueMatcherPattern = null | string | RegExp | NullableStringValuePredicate;

/**
 * Compiles the pattern into a predicate.
 *
 * @param pattern - pattern to compile
 */
export const compileStringValueMatcherPattern = (pattern: StringValueMatcherPattern): StringValuePredicate => {
  if (typeof pattern === "string") {
    return (value) => value === pattern;
  }
  if (pattern instanceof RegExp) {
    return (value) => (value === null ? false : pattern.test(value));
  }
  return pattern;
};

/**
 * Compiles the pattern into a predicate.
 *
 * @param pattern - pattern to compile
 */
export const compileNullableStringValueMatcherPattern = (
  pattern: NullableStringValueMatcherPattern
): NullableStringValuePredicate => {
  if (pattern === null || typeof pattern === "string") {
    return (value) => value === pattern;
  }
  if (pattern instanceof RegExp) {
    return (value) => (value === null ? false : pattern.test(value));
  }
  return pattern;
};
