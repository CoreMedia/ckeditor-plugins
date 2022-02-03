import { ToDataAndViewElementConfiguration } from "@coremedia/ckeditor5-dataprocessor-support/Rules";
import { ElementFilterRulesByName } from "@coremedia/ckeditor5-dataprocessor-support/HtmlFilter";
import { allFilterRules, ElementFilterRule } from "@coremedia/ckeditor5-dataprocessor-support/ElementProxy";
import { asDataFilterRule, AttributeMapper } from "@coremedia/ckeditor5-dataprocessor-support/Attributes";

/**
 * Rule to replace a given element by a new element with an optional
 * class attribute.
 *
 * @param name - name of the replacement element
 * @param className - optional class name to apply
 */
export function replaceBy(name: string, className?: string): ElementFilterRule {
  return (params) => {
    const { node } = params;
    node.name = name;
    if (className) {
      node.classList.add(className);
    }
  };
}

/**
 * Rule to replace a given element and class by a new element, if the class
 * attribute has the expected value.
 *
 * @param originalName - original name of the element to match
 * @param className - class attribute, which must match; this attribute will be removed from the new element
 * @param newName - new element name
 * @param subSequentRules - rules to apply for a mapped element in case the class matches
 */
export function replaceElementAndClassBy(
  originalName: string,
  className: string,
  newName: string,
  ...subSequentRules: ElementFilterRule[]
): ElementFilterRulesByName {
  return {
    [originalName]: (params) => {
      const { node } = params;
      if (!node.classList.contains(className)) {
        return;
      }
      node.classList.remove(className);
      node.name = newName;
      subSequentRules.forEach((r) => r(params));
    },
  };
}

/**
 * Data and View rule to represent an element by a more general element
 * having the identity of the original element stored in the class attribute.
 *
 * @param viewName - name of the view element
 * @param dataName - element name for data
 * @param dataClassName - class attribute value to apply to data element
 * @param attributeMapper - optional mapper for attributes
 */
export function replaceByElementAndClassBackAndForth(
  viewName: string,
  dataName: string,
  dataClassName: string,
  attributeMapper?: AttributeMapper
): ToDataAndViewElementConfiguration {
  const toDataRule = !attributeMapper
    ? replaceBy(dataName, dataClassName)
    : allFilterRules(replaceBy(dataName, dataClassName), asDataFilterRule(attributeMapper));
  const toViewRule = !attributeMapper
    ? replaceElementAndClassBy(dataName, dataClassName, viewName)
    : replaceElementAndClassBy(dataName, dataClassName, viewName, attributeMapper.toView);
  return {
    toData: toDataRule,
    toView: toViewRule,
  };
}
