import {
  compileNullableStringValueMatcherPattern,
  compileStringValueMatcherPattern,
  NullableStringValueMatcherPattern,
  NullableStringValuePredicate,
  StringValueMatcherPattern,
  StringValuePredicate,
} from "./StringValue";

/**
 * View on element for only its name defining attributes.
 */
export type NamedElement = Pick<Element, "namespaceURI" | "localName" | "nodeName" | "tagName" | "prefix">;

/**
 * Attributes of an element representing its name.
 */
export const namedElementAttributes: (keyof NamedElement)[] = [
  "namespaceURI",
  "localName",
  "nodeName",
  "tagName",
  "prefix",
];

/**
 * Expression to match an element's name.
 */
export type ElementNameExpression = Partial<
  {
    [Property in keyof Pick<NamedElement, "namespaceURI" | "prefix">]: NullableStringValueMatcherPattern;
  } & {
    [Property in keyof Omit<NamedElement, "namespaceURI" | "prefix">]: StringValueMatcherPattern;
  }
>;

/**
 * Expression to match an element's name having all patterns transformed to
 * predicates.
 */
export type CompiledElementNameExpression = {
  [Property in keyof Pick<NamedElement, "namespaceURI" | "prefix">]: NullableStringValuePredicate;
} & {
  [Property in keyof Omit<NamedElement, "namespaceURI" | "prefix">]: StringValuePredicate;
};

/**
 * Compiles the given element name expression to an expression only using
 * predicates.
 *
 * @param expression - expression to compile
 */
export const compileElementNameExpression = (expression: ElementNameExpression): CompiledElementNameExpression => {
  const { namespaceURI, localName, nodeName, tagName, prefix } = expression;
  const anyMatch = () => true;
  const namespaceURIExpression: NullableStringValuePredicate =
    namespaceURI === undefined ? anyMatch : compileNullableStringValueMatcherPattern(namespaceURI);
  const localNameExpression: StringValuePredicate =
    localName === undefined ? anyMatch : compileStringValueMatcherPattern(localName);
  const nodeNameExpression: StringValuePredicate =
    nodeName === undefined ? anyMatch : compileStringValueMatcherPattern(nodeName);
  const tagNameExpression: StringValuePredicate =
    tagName === undefined ? anyMatch : compileStringValueMatcherPattern(tagName);
  const prefixExpression: NullableStringValuePredicate =
    prefix === undefined ? anyMatch : compileNullableStringValueMatcherPattern(prefix);
  return {
    namespaceURI: namespaceURIExpression,
    localName: localNameExpression,
    nodeName: nodeNameExpression,
    tagName: tagNameExpression,
    prefix: prefixExpression,
  };
};

/**
 * Predicate to match all aspects of an element's name.
 */
export type ElementNamePredicate = (value: NamedElement) => boolean;

/**
 * Possible matchers to define for element names.
 *
 * * `true` will always signal the element name to match; this is equal to
 *   an empty `ElementNameExpression`. While meaningless at first glance, it
 *   will make the element's name part of the matching result.
 * * `string` will create a strict match for the element's `localName`.
 * * `RegExp` will create a regular expression match on the element's `localName`.
 * * `ElementNameExpression` will match given criteria of element name.
 *   An empty expression will match always, thus, is equivalent to `true`.
 * * `ElementNamePredicate` will signal a match, if the predicate returns `true`.
 */
export type ElementNameMatcherPattern = true | string | RegExp | ElementNameExpression | ElementNamePredicate;

/**
 * Compiles the given pattern for an aspect of the name (like `namespaceURI`,
 * `localName`) to a predicate function.
 *
 * @param pattern - pattern to compile
 */
export const compileElementNameMatcherPattern = (pattern: ElementNameMatcherPattern): ElementNamePredicate => {
  if (typeof pattern === "boolean") {
    // By definition always true. Using `pattern` if we later decide also
    // supporting always `false`.
    return () => pattern;
  }
  if (typeof pattern === "string") {
    return ({ localName }) => pattern === localName;
  }
  if (pattern instanceof RegExp) {
    return ({ localName }) => pattern.test(localName);
  }
  if (typeof pattern === "object") {
    const compiled = compileElementNameExpression(pattern);
    return (value) => {
      for (const attribute of namedElementAttributes) {
        let attributeResult: boolean;
        switch (attribute) {
          case "namespaceURI":
          case "prefix":
            // Nullable attributes.
            attributeResult = compiled[attribute](value[attribute]);
            break;
          default:
            // Non-Nullable attributes.
            attributeResult = compiled[attribute](value[attribute]);
        }
        if (!attributeResult) {
          return false;
        }
      }
      return true;
    };
  }
  return pattern;
};

/**
 * Represents a matched name within an element match.
 *
 * @param element - element, that matched by name
 * @returns name attributes of the given element
 */
export const matchedName = (element: NamedElement): NamedElement => {
  const { namespaceURI, localName, nodeName, tagName, prefix } = element;
  // We could return the element as is, but this strips any irrelevant
  // information.
  return {
    namespaceURI,
    localName,
    nodeName,
    tagName,
    prefix,
  };
};

/**
 * Applies the given predicate, if any, to the given element.
 *
 * Possibly returned values are:
 *
 * * `undefined` iff. the predicate is undefined
 * * `false` iff. the predicate is defined but does not signal a match
 * * details of name aspects of element on match
 *
 * @param element - element to validate
 * @param predicate - optional predicate to use
 */
export const possiblyMatchName = (
  element: NamedElement,
  predicate?: ElementNamePredicate
): undefined | false | ReturnType<typeof matchedName> => {
  if (predicate) {
    if (predicate(element)) {
      return matchedName(element);
    }
    return false;
  }
  return undefined;
};
