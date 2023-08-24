import { HTML2BBCodeRule } from "./DefaultRules";

export const italicRule: HTML2BBCodeRule = {
  id: "Italic",
  toData: (node, content: string) => {
    if (!isItalic(node)) {
      return undefined;
    }
    return `[i]${content}[/i]`;
  },
};

const isItalic = (node: Node): boolean => {
  const nodeName = node.nodeName;
  return nodeName === "I" || nodeName === "EM";
};
