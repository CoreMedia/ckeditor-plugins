import { BBCodeProcessingRule } from "./BBCodeProcessingRule";
import { isHTMLAnchorElement } from "@coremedia/ckeditor5-dom-support";

/**
 * Escapes the given URL, so that it does not contain open or close bracket.
 *
 * @param href - HREF attribute to encode for use as BBCode attribute value
 */
const escapeHref = (href: string): string => href.replace(/\[/g, "%5B").replace(/]/g, "%5D");

export class BBCodeUrl implements BBCodeProcessingRule {
  readonly id = "url";
  readonly tags = ["url"];

  toData(element: HTMLElement, content: string): undefined | string {
    if (!isHTMLAnchorElement(element)) {
      return;
    }
    const { href } = element;
    if (href) {
      return `[url=${escapeHref(href)}]${content}[/url]`;
    }
  }
}

export const bbCodeUrl = new BBCodeUrl();
