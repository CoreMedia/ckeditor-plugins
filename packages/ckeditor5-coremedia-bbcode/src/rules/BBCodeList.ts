import { BBCodeProcessingRule } from "./BBCodeProcessingRule";

/**
 * Maps `<ol>`/`<ul> to `[list]`.
 */
export class BBCodeList implements BBCodeProcessingRule {
  readonly id = "list";
  readonly tags = ["list"];
  toData(element: HTMLElement, content: string): undefined | string {
    if (element instanceof HTMLUListElement) {
      return `[list]\n${content}\n[/list]\n`;
    }
    if (element instanceof HTMLOListElement) {
      return `[list=${element.start}]\n${content}[/list]\n`;
    }
  }
}

export const bbCodeList = new BBCodeList();
