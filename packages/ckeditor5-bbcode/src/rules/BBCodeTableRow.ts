import { BBCodeProcessingRule } from "./BBCodeProcessingRule";

/**
 * Maps `<tr>` to `[tr]`.
 */
export class BBCodeTableRow implements BBCodeProcessingRule {
  readonly id = "table-row";
  readonly tags = ["tr"];
  toData(element: HTMLElement, content: string): undefined | string {
    if (element instanceof HTMLTableRowElement) {
      return `[tr]\n${content.trim()}\n[/tr]\n`;
    }
    return undefined;
  }
}

export const bbCodeTableRow = new BBCodeTableRow();
