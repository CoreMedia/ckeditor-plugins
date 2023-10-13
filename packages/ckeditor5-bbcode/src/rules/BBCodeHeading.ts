import { BBCodeProcessingRule } from "./BBCodeProcessingRule";

/**
 * Regular expression to match heading levels 1 to 6.
 *
 * Examples, that match:
 *
 * ```text
 * h1
 * h2
 * ```
 *
 * **Named Groups:**
 *
 * * `level` (1): The matched heading level.
 *
 */
const headingRegEx = /^h(?<level>[1-6])$/;

/**
 * General rule for any headings to map. Thus, supports BBCode tags
 * `[h1]` to `[h6]`. While not supported by all vendors, it integrates
 * nicely with the Heading Feature by CKEditor 5.
 */
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
      const tag = `h${level}`;
      // Adding newlines for minor pretty-printing.
      return `[${tag}]${content.trim()}[/${tag}]\n\n`;
    }
  }
}

export const bbCodeHeading = new BBCodeHeading();
