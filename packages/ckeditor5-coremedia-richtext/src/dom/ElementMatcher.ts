import { preferUndefinedForNull } from "./Dom";

/**
 * Defines criteria to match. All defined criteria must match.
 */
export interface ElementMatchDefinition {
  name?: ElementNameMatcherPattern;
}

/**
 * Pattern to define criteria of an element to match. Several options exist
 * for matching:
 *
 * * `string` – matches the `localName` of an element on strict equivalence.
 * * `RegExp` – matches the `localName` of an element via regular expression.
 * * `ElementMatcherFunction` – matches element according to given function
 */
export type ElementMatcherPattern = string | RegExp | ElementMatcherFunction;

/**
 * Result when an element matched, to see, which parts of the element matched.
 */
export interface ElementMatch {
  /**
   * Matched name. `undefined` if name was not matched against.
   */
  name?: ElementNameMatch;
}

/**
 * Matcher function. Gets an element and some context, which may be used.
 * Result is either `false` for no match or some match result, which signals,
 * which parts matched.
 */
export type ElementMatcherFunction = (element: Element) => ElementMatch | false;

/**
 * Matcher patterns are compiled into matcher functions, so that they can be
 * easily processed repeatedly without additional parsing effort.
 */
export type CompiledMatcherPattern = ElementMatcherFunction;

/*
 * =============================================================================
 * Element Name Matching
 * =============================================================================
 */

/**
 * Result of a matched name.
 */
export interface ElementNameMatch {
  /**
   * The namespace URI of the matched element, which matched. `undefined` if
   * unset.
   */
  namespaceURI?: string;
  /**
   * The local name of the matched element, which matched.
   */
  localName: string;
  /**
   * The node name of the matched element, which matched.
   */
  nodeName: string;
  /**
   * The tag name of the matched element, which matched.
   */
  tagName: string;
  /**
   * The name prefix of the matched element, which matched. `undefined` if
   * unset.
   */
  prefix?: string;
}

/**
 * Predicate for any part of the name. Context may be one of
 * `namespaceURI`, `localName`, `nodeName`, `tagName`, `prefix`.
 */
export type ElementNameAttributePredicate = (value: string, context: keyof ElementNameMatchDefinition) => boolean;

/**
 * Expects of an element to validate representing its name.
 */
export type NamedElement = Pick<Element, "namespaceURI" | "localName" | "nodeName" | "tagName" | "prefix">;

/**
 * Predicate to match all aspects of an element's name. Note, that
 * unset attributes are `null` rather than `undefined`.
 */
export type ElementNamePredicate = (value: NamedElement) => boolean;

/**
 * Pattern for matching an aspect of the element's name.
 */
export type ElementNameAttributeMatcherPattern = string | RegExp | ElementNameAttributePredicate;

/**
 * Defines criteria to match for an element name. All defined criteria must match.
 */
export interface ElementNameMatchDefinition {
  /**
   * The namespace URI of the matched element, which matched. `undefined` if
   * unset.
   */
  namespaceURI?: ElementNameAttributeMatcherPattern;
  /**
   * The local name of the matched element, which matched.
   */
  localName?: ElementNameAttributeMatcherPattern;
  /**
   * The node name of the matched element, which matched.
   */
  nodeName?: ElementNameAttributeMatcherPattern;
  /**
   * The tag name of the matched element, which matched.
   */
  tagName?: ElementNameAttributeMatcherPattern;
  /**
   * The name prefix of the matched element, which matched. `undefined` if
   * unset.
   */
  prefix?: ElementNameAttributeMatcherPattern;
}

type CompiledElementNameMatchDefinition = {
  [Property in keyof ElementNameMatchDefinition]: ElementNameAttributePredicate;
};

/**
 * Possible matchers to define for element names.
 *
 * * `string` will create a strict match for the element's `localName`.
 * * `RegExp` will create a regular expression match on the element's `localName`.
 * * `ElementNameMatchDefinition` will match given criteria of element name.
 * * `ElementNamePredicate` will signal a match, if the predicate returns `true`.
 */
export type ElementNameMatcherPattern = string | RegExp | ElementNameMatchDefinition | ElementNamePredicate;

/**
 * Compiles the given pattern for an aspect of the name (like `namespaceURI`,
 * `localName`) to a predicate function.
 *
 * @param pattern - pattern to compile
 */
const compileElementNameAttributePredicate = (
  pattern: ElementNameAttributeMatcherPattern
): ElementNameAttributePredicate => {
  if (typeof pattern === "string") {
    return (value) => pattern === value;
  }
  if (pattern instanceof RegExp) {
    return (value) => pattern.test(value);
  }
  return pattern;
};

const compileElementNameMatchDefinition = (definition: ElementNameMatchDefinition): ElementNamePredicate => {
  const compiled: CompiledElementNameMatchDefinition = {};
  Object.entries(definition).forEach(([attr, pattern]: [string, ElementNameAttributeMatcherPattern]) => {
    compiled[attr as keyof CompiledElementNameMatchDefinition] = compileElementNameAttributePredicate(pattern);
  });

  const nameAspects: (keyof NamedElement)[] = ["namespaceURI", "localName", "nodeName", "tagName", "prefix"];

  return (namedElement) => {
    for (const aspect of nameAspects) {
      const predicate = compiled[aspect];
      if (predicate) {
        const aspectValue = namedElement[aspect];
        if (aspectValue) {
          if (!predicate(aspectValue, aspect)) {
            return false;
          }
        } else {
          // We have to match a criterion, but the value is unset: No match.
          return false;
        }
      }
    }
    return true;
  };
};

/*
 * TODO:
 *   2022-11-20:
 *     * test this
 *     * possibly extract to own file like `ElementNameMatcher`.
 *     * write tests
 *     * Use as additional brick in overall matching.
 */
export const compileElementNameMatcherPattern = (pattern: ElementNameMatcherPattern): ElementNamePredicate => {
  if (typeof pattern === "string") {
    return ({ localName }) => pattern === localName;
  }
  if (pattern instanceof RegExp) {
    return ({ localName }) => pattern.test(localName);
  }
  if (typeof pattern === "object") {
    return compileElementNameMatchDefinition(pattern);
  }
  return pattern;
};

/**
 * Represents a matched name within an element match.
 *
 * @param element - element, that matched by name
 * @returns name attributes of the given element
 */
export const matchedName = (element: Element): ElementNameMatch => {
  const { namespaceURI, localName, nodeName, tagName, prefix } = element;
  return {
    namespaceURI: preferUndefinedForNull(namespaceURI),
    localName,
    nodeName,
    tagName,
    prefix: preferUndefinedForNull(prefix),
  };
};

/*
 * =============================================================================
 * Compiling Matcher Patterns
 *
 * The purpose of compiling given matcher patterns is to speed up evaluation
 * during data-processing. All matcher patterns are eventually represented as
 * `CompiledMatcherPattern` function, which can then be automatically applied
 * without further analyzing the configured pattern.
 * =============================================================================
 */

/**
 * Compiles a single string given as matcher pattern. A single string defines
 * a strict match towards the element's `localName`.
 *
 * @param pattern - pattern, which is a `string` to be strictly equal to the
 * `localName` of the validated element
 */
const compileElementMatcherPatternString =
  (pattern: string): CompiledMatcherPattern =>
  (element) => {
    if (element.localName !== pattern) {
      return false;
    }
    const name = matchedName(element);
    return {
      name,
    };
  };

/**
 * Compiles a regular expression given as matcher pattern. A plain regular
 * expression  defines a matcher towards the element's `localName`.
 *
 * @param pattern - expression to validate `localName` of an element
 */
const compileElementMatcherPatternRegExp =
  (pattern: RegExp): CompiledMatcherPattern =>
  (element) => {
    if (!pattern.test(element.localName)) {
      return false;
    }
    const name = matchedName(element);
    return {
      name,
    };
  };

export const compileElementMatcherPattern = (pattern: ElementMatcherPattern): CompiledMatcherPattern => {
  if (typeof pattern === "string") {
    return compileElementMatcherPatternString(pattern);
  }
  if (pattern instanceof RegExp) {
    return compileElementMatcherPatternRegExp(pattern);
  }
  return pattern;
};
