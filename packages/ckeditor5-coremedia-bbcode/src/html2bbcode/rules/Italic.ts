import { HTML2BBCodeRule } from "./DefaultRules";

export const italicRule: HTML2BBCodeRule = {
  id: "Italic",
  toData: (node) => {
    if (!isItalic(node)) {
      return node;
    }
    return `[i]${node.textContent}[/i]`;
  },
};

const isItalic = (node: Node): boolean => {
  const nodeName = node.nodeName;
  return nodeName === "I" || nodeName === "EM";
};
