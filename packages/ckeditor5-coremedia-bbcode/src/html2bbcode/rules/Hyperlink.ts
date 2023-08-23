import { HTML2BBCodeRule } from "./DefaultRules";

export const hyperlinkRule: HTML2BBCodeRule = {
  id: "Hyperlink",
  toData: (node) => {
    if (!isHyperlink(node)) {
      return node;
    }
    return `[url]${node.textContent}[/url]`;
  },
};

const isHyperlink = (node: Node): boolean => {
  const nodeName = node.nodeName;
  return nodeName === "A";
};
