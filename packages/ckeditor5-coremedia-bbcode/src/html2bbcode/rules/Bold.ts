import { HTML2BBCodeRule } from "./HTML2BBCodeRule";

const fontWeightNormal = 400;
const fontWeightBold = 700;
const boldTags = ["b", "strong"];
const nonBoldFontWeights = ["normal", "lighter"];

const parseFontWeight = (fontWeight: string): number | undefined => {
  if (Number.isNaN(fontWeight)) {
    const normalizedFontWeight = fontWeight.trim().toLowerCase();
    if (normalizedFontWeight.startsWith("bold")) {
      return fontWeightBold;
    } else if (nonBoldFontWeights.includes(normalizedFontWeight)) {
      return fontWeightNormal;
    }
  } else {
    return Number(fontWeight);
  }
};

export const boldRule: HTML2BBCodeRule = {
  id: "b",
  tag(taggedElement): void {
    const { element } = taggedElement;
    const {
      tagName,
      style: { fontWeight },
    } = element;
    if (fontWeight) {
      const numericFontWeight = parseFontWeight(fontWeight);
      if (numericFontWeight !== undefined) {
        // Stick to the rule, that we should only set a _truthy_ value, so that
        // we do not accidentally veto decisions on bold state made by other
        // rules.
        //
        // Nevertheless, assuming that we have a bold HTML tag (`<b>` or
        // `<strong>`), we still do not let the below name-based rule set
        // the bold state if the configured font-weight is non-bold.
        if (numericFontWeight > fontWeightNormal) {
          taggedElement.bold = true;
        }
        return;
      }
    }

    if (boldTags.includes(tagName.toLowerCase())) {
      taggedElement.bold = true;
    }
  },
  transform(taggedElement, content): string {
    const { bold } = taggedElement;
    return bold ? `[b]${content}[/b]` : content;
  },
};
