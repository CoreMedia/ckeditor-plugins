/**
 * Parses HTML to BBCode.
 */
import { HTML2BBCodeRule } from "./rules/DefaultRules";
import { isText } from "@coremedia/ckeditor5-dom-support";

export const html2bbcode = (domFragment: Node, rules: HTML2BBCodeRule[]): string =>
  convertWithChildren(domFragment, rules);

/**
 * Recursively traverses all nodes in the given dom fragment and computes a bbcode string
 * from it.
 *
 * @param domFragment - the current node to check
 * @param rules - the bbcode rules that might be applied
 * @returns a bbcode string that matches the given node and its children
 */
const convertWithChildren = (domFragment: Node, rules: HTML2BBCodeRule[]): string => {
  let result = "";

  /**
   * If this is a text node, there will be no children and no
   * further rules need to be applied.
   */
  if (isText(domFragment)) {
    return domFragment.textContent ?? "";
  }

  /**
   * This is not a text node and therefore might have child nodes.
   * If that's the case, we need to compute the resulting strings of
   * the children first, before we can proceed with this node.
   *
   * This code block converts all children to a joined string.
   */
  const children = Array.from(domFragment.childNodes);
  if (children.length > 0) {
    const childResults: string[] = [];
    children.forEach((child) => {
      childResults.push(convertWithChildren(child, rules));
    });
    result = childResults.join("");
  }

  /**
   * Now we can check if any of the given rules apply on the
   * given node. If true, the result string will be wrapped by the
   * computed bbcode. Otherwise, just the result string will be returned.
   */
  for (const rule of rules) {
    const ruleResult = rule.toData(domFragment, result);
    if (ruleResult !== undefined) {
      return ruleResult;
    }
  }
  return result;
};
