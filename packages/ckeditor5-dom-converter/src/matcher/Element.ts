import {
  compileElementNameMatcherPattern,
  ElementNameMatcherPattern,
  matchedName,
  possiblyMatchName,
} from "./ElementName";
import {
  compileDomTokenListMatcherPattern,
  DomTokenListMatcherPattern,
  possiblyMatchDomTokenList,
} from "./DomTokenList";

/**
 * Represents matched aspects of a matched element. Any `undefined` aspects
 * have not been validated.
 */
export interface MatchedElement {
  /**
   * Represents all aspects of a matched name. Not necessarily all aspects
   * have been validated.
   */
  name?: ReturnType<typeof matchedName>;
  /**
   * Respects all class tokens that were a positive match.
   */
  classes?: string[];
}

/**
 * Expression to define criteria to match on given element. Any unset
 * criteria are not checked.
 */
export interface ElementExpression {
  /**
   * Criteria for element name to match.
   */
  name?: ElementNameMatcherPattern;
  classes?: DomTokenListMatcherPattern;
}

/**
 * Predicate to match given element. `false` for no match, otherwise
 * an object representing matched aspects of the given element.
 */
export type ElementPredicate = (value: Element) => false | MatchedElement;

/**
 * Possible patterns to use for matching elements.
 *
 * * `true` matches any element; result will be an empty matched element
 * * `string` for exact match of element name;
 *   on match, result will contain all details of name
 * * `RegExp` for regular expression match of element name
 *   on match, result will contain all details of name
 * * `ElementExpression` for criteria to decide on match or no match
 *   on match, positively matched criteria will be represented in result
 * * `ElementPredicate` predicate to use for matching
 *   on match, result of predicate will be the result
 */
export type ElementMatcherPattern = true | string | RegExp | ElementExpression | ElementPredicate;

/**
 * Compiles a given `ElementExpression` to an `ElementPredicate`.
 *
 * @param expression - expression to compile
 */
const compileElementExpression = (expression: ElementExpression): ElementPredicate => {
  const namePredicate = expression.name ? compileElementNameMatcherPattern(expression.name) : undefined;
  const classesPredicate = expression.classes ? compileDomTokenListMatcherPattern(expression.classes) : undefined;

  return (value): ReturnType<ElementPredicate> => {
    const name = possiblyMatchName(value, namePredicate);
    if (name === false) {
      return false;
    }

    const classes = possiblyMatchDomTokenList(value.classList, classesPredicate);
    if (classes === false) {
      return false;
    }

    return { name, classes };
  };
};

/**
 * Compiles the given pattern as predicate.
 *
 * @param pattern - pattern to compile
 */
export const compileElementMatcherPattern = (pattern: ElementMatcherPattern): ElementPredicate => {
  if (pattern === true) {
    // empty object, as nothing special has been matched
    return () => ({});
  }

  // localName matches
  if (typeof pattern === "string" || pattern instanceof RegExp) {
    const namePredicate = compileElementNameMatcherPattern(pattern);
    return (value) => (namePredicate(value) ? { name: matchedName(value) } : false);
  }

  if (typeof pattern === "object") {
    return compileElementExpression(pattern);
  }

  return pattern;
};
