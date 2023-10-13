import { BBCodeProcessingRule } from "./BBCodeProcessingRule";

/**
 * Maps `<ol>`/`<ul> to `[list]`. Respects the `type` attribute for
 * ordered lists.
 *
 * Note that this requires the CKEditor 5 DocumentList plugin to be configured
 * with `useAttribute`. No support added for list-style options added to this
 * mapping, as `BBob` still will set `type` in `toView` mapping when the
 * HTML5 preset is used.
 *
 * One more note, why `list-style-type` may be the better option: CSS rules
 * may not be applied based on case-sensitive type-attributes. First,
 * browser manufacturers need to incorporate case-sensitive matching as
 * sketched in https://github.com/w3c/csswg-drafts/issues/2101.
 */
export class BBCodeList implements BBCodeProcessingRule {
  readonly id = "list";
  readonly tags = ["list"];
  toData(element: HTMLElement, content: string): undefined | string {
    if (element instanceof HTMLUListElement) {
      return `[list]\n${content.trim()}\n[/list]\n`;
    }
    if (element instanceof HTMLOListElement) {
      return `[list=${element.type || "1"}]\n${content.trim()}\n[/list]\n`;
    }
  }
}

/**
 * Maps `<ol>`/`<ul> to `[list]`. Respects the `type` attribute for
 * ordered lists.
 */
export const bbCodeList = new BBCodeList();
