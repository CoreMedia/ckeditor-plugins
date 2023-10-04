import { isHTMLAnchorElement } from "@coremedia/ckeditor5-dom-support";
import { HTML2BBCodeRule } from "./HTML2BBCodeRule";

export const anchorRule: HTML2BBCodeRule = {
  id: "url",
  process(taggedElement): void {
    const { element } = taggedElement;
    if (!isHTMLAnchorElement(element)) {
      return;
    }
    const { href } = element;
    if (href) {
      taggedElement.link = href;
    }
  },
  transform(taggedElement, content): string {
    const { link } = taggedElement;
    if (!link) {
      return content;
    }
    if (link === true) {
      return `[url]${content}[/url]`;
    }
    return `[url=${link}]${content}[/url]`;
  },
};
