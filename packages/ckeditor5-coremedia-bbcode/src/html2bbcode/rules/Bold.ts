import { HTML2BBCodeRule } from "./DefaultRules";

export const boldRule: HTML2BBCodeRule = {
  id: "Bold",
  toData: (node, content: string) => {
    if (!isBold(node)) {
      return undefined;
    }
    return `[b]${content}[/b]`;
  },
};

const isBold = (node: Node): boolean => {
  const nodeName = node.nodeName;
  return nodeName === "B" || nodeName === "STRONG";
};
