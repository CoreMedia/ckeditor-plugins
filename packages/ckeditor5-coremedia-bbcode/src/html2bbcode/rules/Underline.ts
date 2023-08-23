import { HTML2BBCodeRule } from "./DefaultRules";

export const underlineRule: HTML2BBCodeRule = {
  id: "Underline",
  toData: (node) => {
    if (!isItalic(node)) {
      return node;
    }
    return `[u]${node.textContent}[/u]`;
  },
};

const isItalic = (node: Node): boolean => {
  const nodeName = node.nodeName;
  return nodeName === "U";
};
