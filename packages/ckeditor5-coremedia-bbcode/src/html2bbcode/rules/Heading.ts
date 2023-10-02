import { HTML2BBCodeRule } from "./HTML2BBCodeRule";

const headingRegEx = /^h(?<level>\d)$/;

export const headingRule: HTML2BBCodeRule = {
  id: "p",
  tag(taggedElement): void {
    const { element } = taggedElement;
    if (element instanceof HTMLHeadingElement) {
      taggedElement.separator = {
        before: "\n\n",
        after: "\n\n",
      };
      const match = element.localName.match(headingRegEx);
      if (match) {
        // @ts-expect-error: https://github.com/microsoft/TypeScript/issues/32098
        const { level }: { level: string } = match.groups;
        if (!Number.isNaN(level)) {
          const headingNumber = Number(level);
          if (headingNumber >= 1 && headingNumber <= 6) {
            taggedElement.heading = headingNumber;
          }
        }
      }
    }
  },
  transform(taggedElement, content): string {
    const { heading } = taggedElement;
    return heading ? `[h${heading}]${content}[/h${heading}]` : content;
  },
};
