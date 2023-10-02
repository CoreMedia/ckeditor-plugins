import { HTML2BBCodeRule } from "./HTML2BBCodeRule";

const italicTags = ["i", "em"];
const italicStyles = ["italic", "oblique"];
const italicVetoStyle = "normal";

export const italicRule: HTML2BBCodeRule = {
  id: "i",
  tag(taggedElement): void {
    const { element } = taggedElement;
    const {
      tagName,
      style: { fontStyle },
    } = element;
    if (fontStyle) {
      const normalizedFontStyle = fontStyle.trim().toLowerCase();
      if (italicStyles.includes(normalizedFontStyle)) {
        taggedElement.italic = true;
        return;
      }
      // Skip decision by tag-name.
      if (italicVetoStyle === normalizedFontStyle) {
        return;
      }
    }

    if (italicTags.includes(tagName.toLowerCase())) {
      taggedElement.italic = true;
    }
  },
  transform(taggedElement, content): string {
    const { italic } = taggedElement;
    return italic ? `[i]${content}[/i]` : content;
  },
};
