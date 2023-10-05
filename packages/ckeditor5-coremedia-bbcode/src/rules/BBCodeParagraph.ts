import { BBCodeProcessingRule } from "./BBCodeProcessingRule";

export class BBCodeParagraph implements BBCodeProcessingRule {
  readonly id = "paragraph";

  toData(element: HTMLElement, content: string): string | undefined {
    if (!(element instanceof HTMLParagraphElement)) {
      return;
    }
    return `${content.trim()}\n\n`;
  }
}

export const bbCodeParagraph = new BBCodeParagraph();
