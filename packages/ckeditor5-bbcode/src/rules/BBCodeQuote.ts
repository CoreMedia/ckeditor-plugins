import { BBCodeProcessingRule } from "./BBCodeProcessingRule";

/**
 * Maps `<blockquote>` to `[quote]`.
 */
export class BBCodeQuote implements BBCodeProcessingRule {
  readonly id = "quote";
  readonly tags = ["quote"];
  toData(element: HTMLElement, content: string): undefined | string {
    if (!(element instanceof HTMLQuoteElement)) {
      return;
    }
    const { tagName } = element;
    if ("blockquote" !== tagName.toLowerCase()) {
      // No support for inline `<q>` element.
      return;
    }
    return `[quote]\n${content.trim()}\n[/quote]\n`;
  }
}

export const bbCodeQuote = new BBCodeQuote();
