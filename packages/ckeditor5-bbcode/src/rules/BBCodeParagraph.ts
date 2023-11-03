import { BBCodeProcessingRule } from "./BBCodeProcessingRule";

/**
 * Rule that transforms a paragraph element to its content followed by two
 * newlines.
 */
export class BBCodeParagraph implements BBCodeProcessingRule {
  readonly id = "paragraph";

  toData(element: HTMLElement, content: string): string | undefined {
    if (element instanceof HTMLParagraphElement) {
      return `${content.trim()}\n\n`;
    }
    return undefined;
  }
}

/**
 * Rule instance that transforms a paragraph element to its content followed by
 * two newlines.
 */
export const bbCodeParagraph = new BBCodeParagraph();
