import { ToDataAndViewElementConfiguration } from "@coremedia/ckeditor5-dataprocessor-support/src/Rules";
import { ElementFilterRulesByName } from "@coremedia/ckeditor5-dataprocessor-support/src/HtmlFilter";
import { allFilterRules, ElementFilterRule } from "@coremedia/ckeditor5-dataprocessor-support/src/ElementProxy";
import { asDataFilterRule, AttributeMapper } from "@coremedia/ckeditor5-dataprocessor-support/src/Attributes";
import { warnOnAmbiguousElementState } from "@coremedia/ckeditor5-dataprocessor-support/src/RulesLogger";

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
 * **Ambiguity:** This rule replaces the element name by a new name (and thus,
 * gets a new element). Rules, which matched the original element name will
 * be executed afterward (contained in `subSequentRules`). This handles
 * ambiguous mappings by overriding each other.
 *
 * An example: You have mapping rules `<span class="u">` to element `<u>` and
 * `<span class="s">` to the element `<s>` and vice versa. Now, what about an
 * incoming `<span class="s u">`? One of the mapping rules will be first,
 * for example, replacing the element to `<s>`. As an intermediate state, we will
 * have `<s class="u">`. **But:** In `subsequentRules` we will still have the rule
 * mapping by class `"u"`. Now, the element gets mapped to `<u>` in subsequent
 * rules, the last class being removed. Note that the order of mapping cannot
 * be guaranteed here (we have no predictable order in rules being executed).
 *
 * This approach is considered _as designed_, which is, we have to deal
 * somehow with this ambiguity. Removing both classes will eventually remove
 * the ambiguity as it is decided, which class takes the lead. This is similar
 * to the behavior of headings (`<p class="p--heading-1 p--heading-2">` will
 * resolve ambiguity to `<p class="p--heading-1">`) or text alignment as
 * handled by CKEditor (`<p class="float--left float-right">` will get
 * one of the classes removed when it passed processing in CKEditor).
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
      if (originalName !== node.name && newName !== node.name) {
        // Files a warning for #101 use-case, which we consider as
        // _by design_ as it resolves ambiguous states eventually.
        warnOnAmbiguousElementState(
          `<${originalName}> already got mapped to <${node.name}> by previous rule. Will override previous mapping to replace the element to <${newName}> as denoted by class "${className}".`,
        );
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
  attributeMapper?: AttributeMapper,
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
