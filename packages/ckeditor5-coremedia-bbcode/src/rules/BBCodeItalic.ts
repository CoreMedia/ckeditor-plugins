import { BBCodeProcessingRule } from "./BBCodeProcessingRule";

const italicTags = ["i", "em"];
const italicStyles = ["italic", "oblique"];
const italicVetoStyle = "normal";

export class BBCodeItalic implements BBCodeProcessingRule {
  readonly id = "italic";
  readonly tags = ["i"];
  toData(element: HTMLElement, content: string): undefined | string {
    const { tagName, style } = element;
    const { fontStyle } = style;
    let italic = italicTags.includes(tagName.toLowerCase());

    if (fontStyle) {
      const normalizedFontStyle = fontStyle.trim().toLowerCase();
      if (italicStyles.includes(normalizedFontStyle)) {
        italic = true;
      } else if (italicVetoStyle === normalizedFontStyle) {
        italic = false;
      }
    }

    if (italic) {
      // If it existed: We parsed it, no need for others to respect it.
      style.fontStyle = "";
      return `[i]${content}[/i]`;
    }
  }
}

export const bbCodeItalic = new BBCodeItalic();
