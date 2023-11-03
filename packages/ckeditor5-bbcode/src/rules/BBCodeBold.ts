import { BBCodeProcessingRule } from "./BBCodeProcessingRule";
import { FontWeightInformation, fontWeightToNumber, getFontWeight } from "@coremedia/ckeditor5-dom-support";

/**
 * Possible HTML tags that denote a bold style.
 */
const boldTags = ["b", "strong"];

/**
 * Trigger final decision on bold state.
 *
 * May veto the current assumption.
 *
 * @param assumeBold - if up to now, we assume this to be bold (e.g., `true`
 * when `<strong>` or `<b>` are the corresponding elements).
 * @param fontWeight - font-weight information that could be determined
 */
export type IsBoldFontWeight = (assumedBold: boolean, fontWeight: FontWeightInformation) => boolean;

/**
 * Default `isBold` decision based on font-weight. For any font-weight
 * greater than 400 (or `bold`/`bolder`) it will signal _bold_. For any
 * font-weight less than or equal to 400 (or `normal`/`lighter`) it will
 * signal _non-bold_. For undetermined state by font-weight `assumeBold`
 * will be returned unchanged.
 *
 * @param assumeBold - if up to now we assume _bold_ state
 * @param fontWeight - font-weight retrieved and parsed from `CSSStyleDeclaration`
 * @param fontWeight.asNumber - numeric representation of the font-weight
 */
export const defaultIsBold: IsBoldFontWeight = (assumeBold, { asNumber }) => {
  if (asNumber === undefined) {
    return assumeBold;
  }
  return asNumber > fontWeightToNumber.normal;
};

/**
 * Configuration for `BBCodeBold`.
 */
export interface BBCodeBoldConfig {
  /**
   * May override (or acknowledge) previously made _bold_ decision.
   */
  isBold?: IsBoldFontWeight;
}

/**
 * Processing rule for transforming a bold style represented in HTML
 * (either by tag or font-weight) to `[b]Text[/b]` in BBCode.
 */
export class BBCodeBold implements BBCodeProcessingRule {
  readonly id = "bold";
  readonly tags = ["b"];
  readonly #isBold: IsBoldFontWeight;

  constructor(config: BBCodeBoldConfig = {}) {
    const { isBold = defaultIsBold } = config;
    this.#isBold = isBold;
  }

  toData(element: HTMLElement, content: string): undefined | string {
    const { tagName, style } = element;
    const boldByTag = boldTags.includes(tagName.toLowerCase());
    const fontWeight = getFontWeight(style);
    const bold = fontWeight === undefined ? boldByTag : this.#isBold(boldByTag, fontWeight);

    if (bold || boldByTag !== bold) {
      // We respected the font-weight, either we agreed or vetoed the
      // bold decision. Thus, we may remove the `fontWeight` property
      // as _consumed_.
      style.removeProperty("fontWeight");
    }

    if (bold) {
      return `[b]${content}[/b]`;
    }

    return undefined;
  }
}

/**
 * Processing rule instance for transforming a bold style represented in HTML
 * (either by tag or font-weight) to `[b]Text[/b]` in BBCode.
 */
export const bbCodeBold = new BBCodeBold();
