import { BBCodeProcessingRule } from "./BBCodeProcessingRule";

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
    return `[code]${content}[/code]\n`;
  }
}

export const bbCodeCode = new BBCodeCode();
