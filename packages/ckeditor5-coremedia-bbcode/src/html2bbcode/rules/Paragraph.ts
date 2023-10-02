import { HTML2BBCodeRule } from "./HTML2BBCodeRule";

export const paragraphRule: HTML2BBCodeRule = {
  id: "p",
  tag(taggedElement): void {
    const { element } = taggedElement;
    if (element instanceof HTMLParagraphElement) {
      taggedElement.separator = {
        before: "\n\n",
        after: "\n\n",
      };
    }
  },
};
