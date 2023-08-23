/**
 * Parses HTML to BBCode.
 */
import { HTML2BBCodeRule } from "./rules/DefaultRules";

export const html2bbcode = (domFragment: Node, rules: HTML2BBCodeRule[]): string => {
  return convertWithChildren(domFragment, rules);
};

const convertWithChildren = (domFragment: Node, rules: HTML2BBCodeRule[]): string => {
  let result = "";

  if (domFragment.nodeName === "#text") {
    return domFragment.textContent ?? "";
  }

  const children = Array.from(domFragment.childNodes);
  if (children.length > 0) {
    const results: string[] = [];
    children.forEach((child) => {
      results.push(convertWithChildren(child, rules));
    });
    result = results.join("");
  }

  for (const rule of rules) {
    const ruleResult = rule.toData(domFragment, result);
    if (typeof ruleResult === "string") {
      return ruleResult;
    }
  }
  return result;
};
