import { HTML2BBCodeRule } from "./DefaultRules";

export const boldRule: HTML2BBCodeRule = {
  id: "Bold",
  toData: (node, content: string) => {
    if (!isBold(node)) {
      return node;
    }
    return `[b]${content}[/b]`;
  },
};

const isBold = (node: Node): boolean => {
  const nodeName = node.nodeName;
  return nodeName === "B" || nodeName === "STRONG";
};
