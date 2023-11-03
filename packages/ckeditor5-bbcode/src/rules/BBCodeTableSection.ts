import { BBCodeProcessingRule } from "./BBCodeProcessingRule";
import { isText } from "@coremedia/ckeditor5-dom-support";

/**
 * Maps `<thead>`, `<tbody>`, `<tfoot>` to corresponding BBCode.
 */
export class BBCodeTableSection implements BBCodeProcessingRule {
  readonly id = "table-section";
  readonly tags = ["thead", "tbody", "tfoot"];
  toData(element: HTMLElement, content: string): undefined | string {
    if (!(element instanceof HTMLTableSectionElement)) {
      return undefined;
    }
    const { nextSibling, tagName } = element;

    // Minor Pretty-Print Optimization to not pile up newlines when a
    // corresponding newline already exists in HTML.
    const finalNewline = isText(nextSibling) && nextSibling?.textContent?.startsWith("\n") ? "" : "\n";

    const normalizedTagName = tagName.toLowerCase();

    switch (normalizedTagName) {
      case "thead":
        return `[thead]\n${content.trim()}\n[/thead]${finalNewline}`;
      case "tfoot":
        return `[tfoot]\n${content.trim()}\n[/tfoot]${finalNewline}`;
      case "tbody":
        // More detailed handling below.
        break;
      default:
        return undefined;
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
    return `[tbody]\n${content.trim()}\n[/tbody]${finalNewline}`;
  }
}

export const bbCodeTableSection = new BBCodeTableSection();
