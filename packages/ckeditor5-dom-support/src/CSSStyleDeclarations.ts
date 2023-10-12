import { RgbColor } from "./RgbColor";

/**
 * Regular expression for color names: Only alphabetic.
 */
const colorNameExpression = /^[a-z]*$/i;
/**
 * Signals `true` if the color value should be handled as color name.
 *
 * @param color - color style option value
 */
const assumeColorName = (color: string): boolean => colorNameExpression.test(color);

/**
 * Tries to get the color as object representation from the style declaration.
 * If unset (or empty) returns `undefined`. Color names are returned as is. The
 * same applies to values similar to color names, such as `transparent` or
 * `currentcolor`.
 *
 * @param style - style declaration to get color from
 * @returns `undefined` for unset and/or unmatched color; string for color names
 * or similar; `RgbColor` for parseable colors.
 */
export const getColor = (style: CSSStyleDeclaration): RgbColor | string | undefined => {
  const { color } = style;
  if (!color) {
    return;
  }
  if (assumeColorName(color)) {
    return color;
  }
  // Browsers will parse any styles to `rgb()` or `rgba()` when read from
  // `CSSStyleDeclaration`. We benefit from this, as we can rely on some
  // more or less simple parsing.
  return RgbColor.tryParseRgb(color);
};

/**
 * Some simplistic assumptions on font-weight by key-word.
 */
export const fontWeightToNumber = {
  lighter: 100,
  normal: 400,
  bold: 700,
  bolder: 700,
};

/**
 * Type-guard trick to "cast" to valid font-weight well-known key.
 *
 * @param value - value to guard
 */
const isWellKnownFontWeight = (value: unknown): value is keyof typeof fontWeightToNumber => typeof value === "string" && value in fontWeightToNumber;

/**
 * Tries to get the font-weight from `CSSStyleDeclaration` and transform it
 * into some numeric representation. If the font-weight is unset or cannot be
 * parsed, `undefined` is returned.
 *
 * Regarding relative font-weight-names (lighter, bolder) a normal weighted
 * parent is assumed.
 */
export const getFontWeightNumeric = (style: CSSStyleDeclaration): number | undefined => {
  const { fontWeight } = style;
  const lowerFontWeight = fontWeight.trim().toLowerCase();
  if (lowerFontWeight === "") {
    // Unspecified. No need to continue.
    return;
  }
  const nFontWeight = Number(lowerFontWeight);
  if (Number.isNaN(nFontWeight)) {
    if (isWellKnownFontWeight(lowerFontWeight)) {
      return fontWeightToNumber[lowerFontWeight];
    }
  } else {
    return nFontWeight;
  }
};
