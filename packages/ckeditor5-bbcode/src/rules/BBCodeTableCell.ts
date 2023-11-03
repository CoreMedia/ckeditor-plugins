import { BBCodeProcessingRule } from "./BBCodeProcessingRule";

/**
 * Maps `<td>` to `[td]`, `<th>` to `[th]`.
 */
export class BBCodeTableCell implements BBCodeProcessingRule {
  readonly id = "table-cell";
  readonly tags = ["td", "th"];
  toData(element: HTMLElement, content: string): undefined | string {
    if (!(element instanceof HTMLTableCellElement)) {
      return undefined;
    }
    const { tagName } = element;
    switch (tagName.toLowerCase()) {
      case "td":
        return `[td]${content.trim()}[/td]\n`;
      case "th":
        return `[th]${content.trim()}[/th]\n`;
    }
    return undefined;
  }
}

export const bbCodeTableCell = new BBCodeTableCell();
