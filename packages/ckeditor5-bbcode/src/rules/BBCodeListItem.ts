import { BBCodeProcessingRule } from "./BBCodeProcessingRule";

/**
 * Rule that maps `<li>` to `[*]`.
 */
export class BBCodeListItem implements BBCodeProcessingRule {
  readonly id = "list-item";
  readonly tags = ["*"];
  toData(element: HTMLElement, content: string): undefined | string {
    if (element instanceof HTMLLIElement) {
      return `[*] ${content.trim()}\n`;
    }
    return undefined;
  }
}

/**
 * Rule instance that maps `<li>` to `[*]`.
 */
export const bbCodeListItem = new BBCodeListItem();
