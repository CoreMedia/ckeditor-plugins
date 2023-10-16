import { BBCodeProcessingRule } from "./BBCodeProcessingRule";

/**
 * Rule that transforms a paragraph element to its content followed by two
 * newlines.
 */
export class BBCodeParagraph implements BBCodeProcessingRule {
  readonly id = "paragraph";

  toData(element: HTMLElement, content: string): string | undefined {
    if (!(element instanceof HTMLParagraphElement)) {
      return;
    }
    return `${content.trim()}\n\n`;
  }
}

/**
 * Rule instance that transforms a paragraph element to its content followed by
 * two newlines.
 */
export const bbCodeParagraph = new BBCodeParagraph();
