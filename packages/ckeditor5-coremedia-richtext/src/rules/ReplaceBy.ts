import { ToDataAndViewElementConfiguration } from "@coremedia/ckeditor5-dataprocessor-support/Rules";
import { ElementFilterRulesByName } from "@coremedia/ckeditor5-dataprocessor-support/HtmlFilter";
import { ElementFilterRule } from "@coremedia/ckeditor5-dataprocessor-support/ElementProxy";

/**
 * Rule to replace a given element by a new element with an optional
 * class attribute.
 *
 * @param name name of the replacement element
 * @param className optional class name to apply
 */
export function replaceBy(name: string, className?: string): ElementFilterRule {
  return ({ node }) => {
    node.name = name;
    if (className) {
      node.attributes["class"] = className;
    }
  };
}

/**
 * Rule to replace a given element and class by a new element, if the class
 * attribute has the expected value.
 *
 * @param originalName original name of the element to match
 * @param className class attribute which must match; this attribute will be removed from the new element
 * @param newName new element name
 */
export function replaceElementAndClassBy(
  originalName: string,
  className: string,
  newName: string
): ElementFilterRulesByName {
  return {
    [originalName]: ({ node }) => {
      if (node.attributes["class"] !== className) {
        return;
      }
      delete node.attributes["class"];
      node.name = newName;
    },
  };
}

/**
 * Data and View rule to represent an element by a more general element
 * having the identity of the original element stored in the class attribute.
 *
 * @param viewName name of the view element
 * @param dataName element name for data
 * @param dataClassName class attribute value to apply to data element
 */
export function replaceByElementAndClassBackAndForth(
  viewName: string,
  dataName: string,
  dataClassName: string
): ToDataAndViewElementConfiguration {
  return {
    toData: replaceBy(dataName, dataClassName),
    toView: replaceElementAndClassBy(dataName, dataClassName, viewName),
  };
}
