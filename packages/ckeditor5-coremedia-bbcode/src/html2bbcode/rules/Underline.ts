import { HTML2BBCodeRule } from "./DefaultRules";

export const underlineRule: HTML2BBCodeRule = {
  id: "Underline",
  toData: (node, content: string) => {
    if (!isItalic(node)) {
      return undefined;
    }
    return `[u]${content}[/u]`;
  },
};

const isItalic = (node: Node): boolean => {
  const nodeName = node.nodeName;
  return nodeName === "U";
};
