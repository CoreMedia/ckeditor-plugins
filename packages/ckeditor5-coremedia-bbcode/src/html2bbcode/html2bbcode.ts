import { HasChildren, isHTMLElement, isParentNode } from "@coremedia/ckeditor5-dom-support";
import { HTML2BBCodeRule } from "./rules/HTML2BBCodeRule";
import { TaggedElement } from "./rules/TaggedElement";

/**
 * Parses HTML to BBCode.
 */
export const html2bbcode = (domFragment: Node, rules: HTML2BBCodeRule[]): string =>
  new Html2BBCodeConverter(rules).convert(domFragment);

export class Html2BBCodeConverter {
  readonly #rules: HTML2BBCodeRule[];

  constructor(rules: HTML2BBCodeRule[] = []) {
    this.#rules = rules;
  }

  convert(node: Node): string {
    const { content, separator } = this.#convertWithChildren(node);
    const { after = "", before = "" } = separator ?? {};
    const convertedContent = `${before}${content}${after}`;
    // Replace leading and trailing newlines.
    convertedContent.replace(/(^[\n\r]*|[\n\r]*$)/, "");
    return convertedContent;
  }

  #convertWithChildren(node: Node): {
    content: string;
    separator?: {
      before?: string;
      after?: string;
    };
  } {
    if (!isParentNode(node)) {
      return { content: node.textContent ?? "" };
    }

    const processedChildren = this.#convertChildren(node);

    if (isHTMLElement(node)) {
      return this.#convertHtmlElement(node, processedChildren);
    } else {
      return {
        content: processedChildren.content,
      };
    }
  }

  #convertHtmlElement(
    node: HTMLElement,
    processedChildren: { content: string; firstBefore: string; lastAfter: string },
  ) {
    const rules = this.#rules;
    const taggedElement = new TaggedElement(node);

    // Stage 1: Let all rules state their opinion about the state.
    for (const rule of rules) {
      rule.tag?.(taggedElement);
    }

    const { separator: parentSeparator } = taggedElement;

    if (parentSeparator?.before === processedChildren.firstBefore) {
      parentSeparator.before = "";
    }

    if (parentSeparator?.after === processedChildren.lastAfter) {
      parentSeparator.after = "";
    }

    let content = processedChildren.content;

    for (const rule of rules) {
      content = rule.transform?.(taggedElement, content) ?? content;
    }

    return {
      content,
      separator: parentSeparator,
    };
  }

  #convertChildren(node: HasChildren): {
    content: string;
    firstBefore: string;
    lastAfter: string;
  } {
    const childNodes = Array.from(node.childNodes);
    let childContent = "";
    let previousAfter = "";
    let firstBefore = "";

    childNodes.forEach((value: ChildNode, index: number): void => {
      const { content, separator } = this.#convertWithChildren(value);

      let before = "";
      if (separator?.before) {
        before = separator.before;
        if (index === 0) {
          // Simple de-duplication of separators.
          firstBefore = before;
        }
      }

      const after = separator?.after ?? "";

      // Simple de-duplication of separators.
      if (before === previousAfter) {
        before = "";
      }
      childContent = `${childContent}${before}${content}${after}`;
      previousAfter = after;
    });
    return { content: childContent, firstBefore, lastAfter: previousAfter };
  }
}
