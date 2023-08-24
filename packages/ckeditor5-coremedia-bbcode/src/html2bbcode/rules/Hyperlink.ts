import { HTML2BBCodeRule } from "./DefaultRules";
import { isElement } from "@coremedia/ckeditor5-dom-support";

export const hyperlinkRule: HTML2BBCodeRule = {
  id: "Hyperlink",
  toData: (node, content: string) => {
    if (!isHyperlink(node)) {
      return undefined;
    }
    if (!isElement(node)) {
      return `[url]${content}[/url]`;
    }
    const href = node.getAttribute("href");
    return `[url=${href}]${content}[/url]`;
  },
};

const isHyperlink = (node: Node): boolean => {
  const nodeName = node.nodeName;
  return nodeName === "A";
};
