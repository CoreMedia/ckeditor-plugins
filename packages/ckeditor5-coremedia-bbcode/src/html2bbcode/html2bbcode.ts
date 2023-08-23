/**
 * Parses HTML to BBCode.
 */
import { HTML2BBCodeRule } from "./rules/DefaultRules";

export const html2bbcode = (domFragment: Node, rules: HTML2BBCodeRule[]): string => {
  const result = convertWithChildren(domFragment, rules);
  return result;
};

const convertWithChildren = (domFragment: Node, rules: HTML2BBCodeRule[]): string => {
  console.log("NODE", domFragment.nodeName)
  let result = "";
  const children = Array.from(domFragment.childNodes);
  if (children.length > 0) {
    const results: string[] = [];
    children.forEach((child) => {
      console.log("GOTO CHILD");
      results.push(convertWithChildren(child, rules));
    });
    result = results.join("");
    console.log("ALL CHILDREN STRING:", result, "(",domFragment.nodeName,")");
  }

  for (const rule of rules) {
    const ruleResult = rule.toData(domFragment);
    if (typeof ruleResult === "string") {
      console.log("RULE APPLIED RETURN ", ruleResult, "(",domFragment.nodeName,")");
      return ruleResult;
    }
  }

  if (domFragment.nodeName === "#text") {
    console.log("RETURN TEXTCONTENT", domFragment.textContent ?? "");
    return domFragment.textContent ?? "";
  }

  console.log("RETURN CHILDREN STRING", "(",domFragment.nodeName,")");
  return result;
};

/*
const checkDocumentFragment = (fragment: Node | DocumentFragment): Node | DocumentFragment => {
  if (fragment.is("element")) {
    const element = fragment as Element;
    element.
  }
}*/

/*const convertNode = (node: Node) => {
  let result: Node | Skip = importedNode;
  for (const rule of this.#rules) {
    if (result === skip) {
      return skip;
    }
    result = rule.imported?.(result, context) ?? result;
  }
  return result;
}*/

/*
export class HTML2BBCodeConverter {
  readonly rules: HTML2BBCodeRule[];

  constructor(rules: HTML2BBCodeRule[]) {
    this.rules = rules;
  }

  convertNode: (node: Node) => {
    let result: Node | Skip = importedNode;
    for (const rule of this.#rules) {
      if (result === skip) {
        return skip;
      }
      result = rule.imported?.(result, context) ?? result;
    }
    return result;
  }
}*/
