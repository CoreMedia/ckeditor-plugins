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
