import { BBCodeProcessingRule } from "./BBCodeProcessingRule";

/**
 * A font-weight, we consider _normal_ weighted.
 */
const fontWeightNormal = 400;
/**
 * A font-weight, we consider _bold_ weighted.
 */
const fontWeightBold = 700;
/**
 * Possible HTML tags that denote a bold style.
 */
const boldTags = ["b", "strong"];
/**
 * Font-weight entries, we identify to veto any possible bold tag.
 */
const nonBoldFontWeights = ["normal", "lighter"];
/**
 * Validate, if the given font-weight represents a numeric value.
 *
 * @param weight - weight parameter value to check
 */
const isNumericFontWeight = (weight: string): boolean => /^\d+$/.test(weight);

/**
 * Parses a possibly set `fontWeight` attribute to some numeric representation
 * suitable to determine, if the `fontWeight` denotes some bold appearance.
 *
 * @param fontWeight - font weight attribute value to parse
 */
const parseFontWeight = (fontWeight: string): number | undefined => {
  const trimmedWeight = fontWeight.trim().toLowerCase();
  if (!trimmedWeight) {
    return;
  }
  if (isNumericFontWeight(trimmedWeight)) {
    return Number(trimmedWeight);
  }
  if (trimmedWeight.startsWith("bold")) {
    return fontWeightBold;
  } else if (nonBoldFontWeights.includes(trimmedWeight)) {
    return fontWeightNormal;
  }
};

/**
 * Processing rule for transforming a bold style represented in HTML
 * (either by tag or font-weight) to `[b]Text[/b]` in BBCode.
 */
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

/**
 * Processing rule instance for transforming a bold style represented in HTML
 * (either by tag or font-weight) to `[b]Text[/b]` in BBCode.
 */
export const bbCodeBold = new BBCodeBold();
