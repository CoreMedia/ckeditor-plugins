import { BBCodeProcessingRule } from "./BBCodeProcessingRule";

/**
 * Maps `<table>` to `[table]`.
 */
export class BBCodeTable implements BBCodeProcessingRule {
  readonly id = "table";
  readonly tags = ["table"];
  toData(element: HTMLElement, content: string): undefined | string {
    if (element instanceof HTMLTableElement) {
      return `[table]\n${content.trim()}\n[/table]\n`;
    }
  }
}

export const bbCodeTable = new BBCodeTable();
