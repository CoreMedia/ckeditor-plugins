import { StyleKey } from "./Dom";
import { MatcherContext } from "./Matcher";

/**
 * Result when an element matched, to see, which parts of the element matched.
 */
export interface ElementMatch {
  /**
   * Matched name. `undefined` if name was not matched against.
   */
  name?: string;
  /**
   * Matched attributes. `undefined` if not matching against attributes.
   */
  attributes?: readonly string[];
  /**
   * Matched class names. `undefined` if not matching against class names.
   */
  classes?: readonly string[];
  /**
   * Matched styles. `undefined` if not matching against styles.
   */
  styles?: readonly [StyleKey, string][];
}

/**
 * Matcher function. Gets an element and some context, which may be used.
 * Result is either `false` for no match or some match result, which signals,
 * which parts matched.
 */
export type ElementMatcherFunction = (element: Element, context: MatcherContext) => ElementMatch | false;

/**
 * Defines criteria to match. All defined attributes must match.
 */
export interface ElementMatchDefinition {
  // TODO: Do we want to provide match on namespace, too?
  name?: string | RegExp;
  attributes?: unknown;
  classes?: ClassesMatchDefinition;
  styles?: StylesMatchDefinition;
}

/*
 * Possibly continue here... only pick some attributes? also forward ownerElement? Then we may also want to forward this to other predicates.
 * `data` is something other we may want to match.
 */
export type StylePredicate = (styleKey: StyleKey, styleValue: string) => boolean;

/**
 * Defines criteria to match for style attributes.
 *
 * * `string` – exact match for `all` key, thus complete style parameter.
 *   Complete styles will be contained in match result.
 * * `RegExp` – exact match for `all` key, thus complete style parameter.
 *   Complete styles will be contained in match result.
 * * `Record` – each given key must exist, and if string or regular expression
 *   is specified, it must match the corresponding value (exact match for
 *   `string`). Match result will contain all matched styles.
 * * `StylePredicate` – at least one predicate must match the given predicate;
 *   match result will contain all matched styles.
 */
export type StylesMatchDefinition = string | RegExp | Record<StyleKey, true | string | RegExp> | StylePredicate;

export type ClassPredicate = (className: string, index: number, classes: string[]) => boolean;

/**
 * Defines criteria to match for class attribute.
 *
 * * `string` – any class name must be strictly equal to given class name;
 *   only this matched class will be represented in the result
 * * `RegExp` – at least one class name must match the given regular expression;
 *   match result will contain all matched class names
 * * `ClassPredicate` – at least one class must match the given predicate;
 *   match result will contain all matched class names
 */
export type ClassesMatchDefinition = string | RegExp | ClassPredicate;

/**
 * Possible patterns to use for matching.
 *
 * * `string` for exact match of element name
 * * `RegExp` for regular expression match of element name
 * * `ElementMatcherFunction` for function to decide on match or no match
 */
export type ElementMatcherPattern = string | RegExp | ElementMatcherFunction;
