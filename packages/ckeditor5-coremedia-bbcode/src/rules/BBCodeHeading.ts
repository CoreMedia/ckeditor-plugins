import { BBCodeProcessingRule } from "./BBCodeProcessingRule";

const headingRegEx = /^h(?<level>\d)$/;

const isValidHeadingLevel = (level: string): boolean => /^[1-6]+$/.test(level);

export class BBCodeHeading implements BBCodeProcessingRule {
  readonly id = "heading";
  readonly tags = ["h1", "h2", "h3", "h4", "h5", "h6"];

  toData(element: HTMLElement, content: string): string | undefined {
    if (!(element instanceof HTMLHeadingElement)) {
      return;
    }
    const match = element.localName.match(headingRegEx);
    if (match) {
      // @ts-expect-error: https://github.com/microsoft/TypeScript/issues/32098
      const { level }: { level: string } = match.groups;
      if (!isValidHeadingLevel(level)) {
        const tag = `h${level}`;
        return `[${tag}]${content}[/${tag}]\n\n`;
      }
    }
  }
}

export const bbCodeHeading = new BBCodeHeading();
