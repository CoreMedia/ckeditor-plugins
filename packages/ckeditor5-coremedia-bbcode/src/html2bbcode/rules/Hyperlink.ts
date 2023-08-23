import { HTML2BBCodeRule } from "./DefaultRules";

export const hyperlinkRule: HTML2BBCodeRule = {
  id: "Hyperlink",
  toData: (node, content: string) => {
    if (!isHyperlink(node)) {
      return node;
    }
    return `[url]${content}[/url]`;
  },
};

const isHyperlink = (node: Node): boolean => {
  const nodeName = node.nodeName;
  return nodeName === "A";
};
