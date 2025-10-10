import { isHTMLImageElement } from "@coremedia/ckeditor5-dom-support";
import { BBCodeProcessingRule } from "./BBCodeProcessingRule";
import { toBBCodeStringAttributeValue, toBBCodeUrl } from "./EscapeUtils";

/**
 * Rule that maps images to `[img]` tag.
 */
export class BBCodeImg implements BBCodeProcessingRule {
  readonly id = "img";
  readonly tags = ["img"];

  toData(element: HTMLElement): undefined | string {
    if (!isHTMLImageElement(element)) {
      return undefined;
    }

    let startTag = "img";
    const closeTag = "img";

    // Need to use `getAttribute` instead of HTMLAnchorElement.href as the
    // latter one may contain an already parsed `src`, that, for example,
    // already resolved relative links to absolute links.
    const src = element.getAttribute("src");

    if (!src) {
      // No valid/expected image element. Hand over to further processing
      // that may eventually delete the image tag if no other rules kick in.
      return undefined;
    }

    const { asContent } = toBBCodeUrl(src);

    const { alt } = element;

    if (alt) {
      startTag = `${startTag} alt=${toBBCodeStringAttributeValue(alt)}`;
    }

    return `[${startTag}]${asContent}[/${closeTag}]`;
  }
}

/**
 * Rule instance that maps images to `[img]` tag.
 */
export const bbCodeImg = new BBCodeImg();
