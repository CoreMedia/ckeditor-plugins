import { HasChildren, isHTMLElement, isParentNode } from "@coremedia/ckeditor5-dom-support";
import { BBCodeProcessingRule } from "./rules/BBCodeProcessingRule";
import { bbCodeDefaultRules } from "./rules/bbCodeDefaultRules";
import { removeLeadingAndTrailingNewlines } from "./BBCodeUtils";

/**
 * Parses HTML to BBCode.
 */
export const html2bbcode = (domFragment: Node, rules: BBCodeProcessingRule[] = bbCodeDefaultRules): string =>
  new Html2BBCodeConverter(rules).convert(domFragment);

/**
 * Adds backslashes to any possibly existing square brackets within the given
 * text so that it is not interpreted by BBCode parser. Also, a backslash
 * itself will be escaped.
 *
 * Note that it should be ensured that corresponding BBCode parsers reading
 * the data, support this type of escaping.
 *
 * @param text - plain text to escape
 */
const escapeText = (text: string): string => text.replace(/([\][\\])/g, "\\$1");

export class Html2BBCodeConverter {
  constructor(readonly rules: BBCodeProcessingRule[] = bbCodeDefaultRules) {}

  convert(node: Node): string {
    return this.#convertWithChildren(node).trim();
  }

  #convertWithChildren(node: Node): string {
    if (!isParentNode(node)) {
      return escapeText(node.textContent ?? "");
    }

    const childContent = this.#convertChildren(node);

    if (isHTMLElement(node)) {
      return this.#convertHtmlElement(node, childContent);
    } else {
      return childContent;
    }
  }

  #convertHtmlElement(node: HTMLElement, childContent: string) {
    const { rules } = this;
    let content = childContent;

    for (const rule of rules) {
      content = rule.toData?.(node, content) ?? content;
    }

    return content;
  }

  #convertChildren(node: HasChildren): string {
    const childNodes = Array.from(node.childNodes);
    let childContent = "";
    for (const childNode of childNodes) {
      childContent = `${childContent}${this.#convertWithChildren(childNode)}`;
    }
    return childContent;
  }
}
