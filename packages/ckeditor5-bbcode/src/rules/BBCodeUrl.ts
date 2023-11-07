import { BBCodeProcessingRule } from "./BBCodeProcessingRule";
import { isHTMLAnchorElement } from "@coremedia/ckeditor5-dom-support";
import { escapeUrlForBBCodeAttribute } from "./EscapeUtils";

/**
 * Rule that maps anchors with `href` to `[url]` tag.
 */
export class BBCodeUrl implements BBCodeProcessingRule {
  readonly id = "url";
  readonly tags = ["url"];

  toData(element: HTMLElement, content: string): undefined | string {
    if (!isHTMLAnchorElement(element)) {
      return undefined;
    }
    // Need to use `getAttribute` instead of HTMLAnchorElement.href as the
    // latter one may contain an already parsed `href`, that, for example,
    // already resolved relative links to absolute links.
    const href = element.getAttribute("href");
    if (href) {
      const escapedHref = escapeUrlForBBCodeAttribute(href);
      if (href === escapedHref && href === content) {
        // There was nothing to escape. We may now safely apply some pretty-print
        // optimization if content and HREF are strictly equal to one another.
        return `[url]${content}[/url]`;
      }
      return `[url=${escapedHref}]${content}[/url]`;
    }
    return undefined;
  }
}

/**
 * Rule instance that maps anchors with `href` to `[url]` tag.
 */
export const bbCodeUrl = new BBCodeUrl();
