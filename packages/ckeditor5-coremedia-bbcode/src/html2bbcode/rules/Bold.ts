import { HTML2BBCodeRule } from "./DefaultRules";

export const boldRule: HTML2BBCodeRule = {
  id: "Bold",
  toData: (node) => {
    if (!isBold(node)) {
      return node;
    }
    return `[b]${node.textContent}[/b]`;
  },
};

const isBold = (node: Node): boolean => {
  const nodeName = node.nodeName;
  return nodeName === "B" || nodeName === "STRONG";
};
