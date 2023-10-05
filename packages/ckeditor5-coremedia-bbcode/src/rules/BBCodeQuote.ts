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
    const { tagName} = element;
    if ("quote" !== tagName.toLowerCase()) {
      // No support for inline `<q>` element.
      return;
    }
    return `[quote]${content}[/quote]\n`;
  }
}

export const bbCodeQuote = new BBCodeQuote();
