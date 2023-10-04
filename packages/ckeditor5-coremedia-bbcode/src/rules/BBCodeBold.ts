import { BBCodeProcessingRule } from "./BBCodeProcessingRule";

const fontWeightNormal = 400;
const fontWeightBold = 700;
const boldTags = ["b", "strong"];
const nonBoldFontWeights = ["normal", "lighter"];

/**
 * Parses a possibly set `fontWeight` attribute to some numeric representation
 * suitable to determine, if the `fontWeight` denotes some bold appearance.
 *
 * @param fontWeight - font weight attribute value to parse
 */
const parseFontWeight = (fontWeight: string): number | undefined => {
  if (Number.isNaN(fontWeight)) {
    const normalizedFontWeight = fontWeight.trim().toLowerCase();
    if (normalizedFontWeight.startsWith("bold")) {
      return fontWeightBold;
    } else if (nonBoldFontWeights.includes(normalizedFontWeight)) {
      return fontWeightNormal;
    }
  } else if (fontWeight) {
    return Number(fontWeight);
  }
};

export class BBCodeBold implements BBCodeProcessingRule {
  readonly id = "bold";
  readonly tags = ["b"];
  toData(element: HTMLElement, content: string): undefined | string {
    const { tagName, style } = element;
    const { fontWeight } = style;
    const parsedWeight = parseFontWeight(fontWeight);
    let bold = boldTags.includes(tagName.toLowerCase());
    if (parsedWeight !== undefined) {
      // If already bold, may also veto it.
      bold = parsedWeight > fontWeightNormal;
    }
    if (bold) {
      // If it existed: We parsed it, no need for others to respect it.
      style.fontWeight = "";
      return `[b]${content}[/b]`;
    }
  }
}

export const bbCodeBold = new BBCodeBold();
