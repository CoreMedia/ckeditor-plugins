import { BBCodeProcessingRule } from "./BBCodeProcessingRule";

/**
 * Possible HTML tags that denote content rendered in italic.
 * CKEditor 5 defaults to using `<i>`.
 */
const italicTags = ["i", "em"];

/**
 * Possible font-style options that denote content rendered in italic.
 */
const italicStyles = ["italic", "oblique"];

/**
 * Possible font-style options that may veto rendering content rendered
 * in italic.
 */
const italicVetoStyle = "normal";

/**
 * Processing rule for transforming an italic style represented in HTML
 * (either by tag or font-style) to `[i]Text[/i]` in BBCode.
 */
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
      // If it existed, we parsed it, no need for others to respect it.
      style.removeProperty("fontStyle");
      return `[i]${content}[/i]`;
    }

    return undefined;
  }
}

/**
 * Processing rule instance for transforming an italic style represented in HTML
 * (either by tag or font-style) to `[i]Text[/i]` in BBCode.
 */
export const bbCodeItalic = new BBCodeItalic();
