import { BBCodeProcessingRule } from "./BBCodeProcessingRule";
import { removeLeadingAndTrailingNewlines } from "../BBCodeUtils";

const escapeLanguage = (language: string): string => language.replace(/([\][])/g, "\\$1");

/**
 * Maps `<pre>` to `[code]`.
 */
export class BBCodeCode implements BBCodeProcessingRule {
  readonly id = "code";
  readonly tags = ["code"];
  toData(element: HTMLElement, content: string): undefined | string {
    if (!(element instanceof HTMLPreElement)) {
      return;
    }
    // CKEditor 5 encodes the language as `language` in dataset.
    const {
      dataset: { language },
    } = element;
    const trimmed = removeLeadingAndTrailingNewlines(content);
    if (language) {
      return `[code=${escapeLanguage(language)}]${trimmed}\n[/code]\n`;
    }
    return `[code]\n${trimmed}\n[/code]\n`;
  }
}

export const bbCodeCode = new BBCodeCode();
