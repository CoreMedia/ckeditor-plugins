import { BBCodeProcessingRule } from "./BBCodeProcessingRule";

/**
 * Maps `<li>` to `[*]`.
 */
export class BBCodeListItem implements BBCodeProcessingRule {
  readonly id = "list-item";
  readonly tags = ["*"];
  toData(element: HTMLElement, content: string): undefined | string {
    if (element instanceof HTMLLIElement) {
      return `[*] ${content.trim()}\n`;
    }
  }
}

export const bbCodeListItem = new BBCodeListItem();
