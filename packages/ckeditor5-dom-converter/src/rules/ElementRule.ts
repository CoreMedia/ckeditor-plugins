import { Rule } from "./Rule";
import { ElementRuleExecutable, ElementRuleExecutableResponse } from "./ElementRuleExecutable";
import { ElementNameMatcherPattern } from "../matcher/ElementName";
import { ElementMatcher } from "../matcher/ElementMatcher";
import { compileElementDefinition, createElement, ElementDefinitionType } from "../dom/Element";

/**
 * Represents an element rule.
 */
export class ElementRule extends Rule<Element, ElementRuleExecutableResponse> {}

export const elementToElementByClass = (fromElement: ElementNameMatcherPattern, className: string, toElement: ElementDefinitionType): ElementRule => {
  const matcher = new ElementMatcher({ name: fromElement, classes: className });
  const executable: ElementRuleExecutable = (params) => {
    const { targetDocument } = params;
    const element = createElement({
      document: targetDocument,
      ...compileElementDefinition(toElement),
    });
    return {
      node: element,
    };
  };
  /*
   * TODO:
   *   * Respect priority.
   *   * Copy attributes.
   *   * How to handle already created elements, handled by subsequent rules
   *     (like first mapping by class, then adding classes from data attributes)?
   *     We possibly need to remember created elements to forward them to
   *     subsequent rules. Thus should just be aware, that nodes are typically
   *     not attached, yet. May require documentation, that you have to get
   *     priorities straight.
   *     What about first getting all applicable rules, then applying them one
   *     by one? Seems to make more sense.
   *   * Another method: copyElement - this should take care of the element
   *     namespace. If it is the same as the source document, the namespace
   *     should be the same as the target document.
   *   * Check, if it is ok, that in here the namespace defaults to `null`
   *     It may be better to default to the target document namespace if unset.
   */
  return new ElementRule(matcher, executable);
};
