import { BBCodeProcessingRule } from "./BBCodeProcessingRule";
import { removeLeadingAndTrailingNewlines } from "../BBCodeUtils";

/**
 * Maps `<thead>`, `<tbody>`, `<tfoot>` to corresponding BBCode.
 */
export class BBCodeTableSection implements BBCodeProcessingRule {
  readonly id = "table-section";
  readonly tags = ["thead", "tbody", "tfoot"];
  toData(element: HTMLElement, content: string): undefined | string {
    if (!(element instanceof HTMLTableSectionElement)) {
      return;
    }
    const { tagName } = element;
    const normalizedTagName = tagName.toLowerCase();
    switch (normalizedTagName) {
      case "thead":
        return `[thead]\n${content.trim()}\n[/thead]\n`;
      case "tfoot":
        return `[tfoot]\n${content.trim()}\n[/tfoot]\n`;
      case "tbody":
        // More detailed handling below.
        break;
      default:
        return;
    }
    // We now know that we have a `<tbody>` element. Apply some
    // simplification to the resulting BBCode, when `<tbody>` is the only
    // table section element.
    const { parentElement } = element;
    if (parentElement?.childElementCount === 1) {
      // Just ignore this section element as being the only one
      // within the table. Thus, no need for surrounding `[tbody]`.
      return content.trim();
    }
    return `[tbody]\n${content.trim()}\n[/tbody]\n`;
  }
}

export const bbCodeTableSection = new BBCodeTableSection();
