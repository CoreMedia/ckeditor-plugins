import { BBCodeProcessingRule } from "./BBCodeProcessingRule";

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
    if (language) {
      return `[code=${escapeLanguage(language)}]${content}[/code]\n`;
    }
    return `[code]${content}[/code]\n`;
  }
}

export const bbCodeCode = new BBCodeCode();
