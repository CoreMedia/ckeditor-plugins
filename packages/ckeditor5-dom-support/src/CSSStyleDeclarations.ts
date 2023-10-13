import { RgbColor } from "./RgbColor";
import { RequireSelected } from "@coremedia/ckeditor5-common";

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
 *
 * This map is just meant for a rough decision on bold/non-bold, as the
 * relative weight mapping ignores the required parent context for correct
 * transformation.
 */
export const fontWeightToNumber = {
  /**
   * Numeric representation for `lighter`. Value equals a typical value
   * for `lighter` in `computedStyleMap()` when parent has
   * font-weight `normal`.
   */
  lighter: 100,
  /**
   * Numeric representation for `normal` as it is typically used in
   * browsers.
   */
  normal: 400,
  /**
   * Numeric representation for `bold` as it is typically used in
   * browsers.
   */
  bold: 700,
  /**
   * Numeric representation for `bolder`. Value equals a typical value
   * for `bolder` in `computedStyleMap()` when parent has
   * font-weight `bold`.
   */
  bolder: 900,
};

/**
 * Maps well-known (fixed size) numeric font-weights to their textual
 * representation. Skips relative weights, as a mapping would require
 * context information from parents.
 */
export const numberToFontWeight = Object.fromEntries(
  Object.entries(fontWeightToNumber)
    .filter(([name]) => !name.endsWith("er"))
    .map(([name, weight]) => [weight, name]),
);

/**
 * Type-guard trick to "cast" to valid font-weight well-known key.
 *
 * @param value - value to guard
 */
const isWellKnownFontWeight = (value: unknown): value is keyof typeof fontWeightToNumber =>
  typeof value === "string" && value in fontWeightToNumber;

/**
 * Type-guard trick to "cast" to valid font-weight well-known number key.
 *
 * @param value - value to guard
 */
const isWellKnownFontWeightNumber = (value: unknown): value is keyof typeof numberToFontWeight =>
  typeof value === "number" && value in numberToFontWeight;

/**
 * Information
 */
export interface FontWeightInformation {
  asText?: string;
  asNumber?: number;
}

/**
 * Retrieves font-weight information from style.
 *
 * If `undefined`, font-weight information is unavailable (unset, empty).
 *
 * If font-weight is given as number, for some well-known weights a text
 * representation is provided in addition to the number.
 *
 * For a well-known font-weight, the corresponding numeric value augments
 * the text representation.
 *
 * Note that numeric and text representation follow simple matching without
 * in-depth analysis of the surroundings. As such, `bolder` will reveal the
 * same numeric representation as it is typical for a parent having
 * font-weight `bold`. Similar, `lighter` will be represented by a value
 * typically used by browsers, when the parent has font-weight `normal`.
 *
 * @param style - style to get `fontWeight` information from
 */
export const getFontWeight = (
  style: CSSStyleDeclaration,
):
  | undefined
  | RequireSelected<FontWeightInformation, "asNumber">
  | RequireSelected<FontWeightInformation, "asText">
  | Required<FontWeightInformation> => {
  const { fontWeight } = style;
  const lowerFontWeight = fontWeight.trim().toLowerCase();
  if (lowerFontWeight === "") {
    // Unspecified. No need to continue.
    return;
  }
  const nFontWeight = Number(lowerFontWeight);
  if (Number.isNaN(nFontWeight)) {
    if (isWellKnownFontWeight(lowerFontWeight)) {
      return {
        asText: lowerFontWeight,
        asNumber: fontWeightToNumber[lowerFontWeight],
      };
    }
    return {
      asText: lowerFontWeight,
    };
  } else {
    if (isWellKnownFontWeightNumber(nFontWeight)) {
      return {
        asText: numberToFontWeight[nFontWeight],
        asNumber: nFontWeight,
      };
    } else {
      return {
        asNumber: nFontWeight,
      };
    }
  }
};

/**
 * Tries to get the font-weight from `CSSStyleDeclaration` and transform it
 * into some numeric representation. If the font-weight is unset or cannot be
 * parsed, `undefined` is returned.
 *
 * Regarding relative font-weight-names (lighter, bolder), a normal weighted
 * parent is assumed.
 */
export const getFontWeightNumeric = (style: CSSStyleDeclaration): number | undefined => {
  const fontWeightInformation = getFontWeight(style);
  if (!fontWeightInformation) {
    return;
  }
  return fontWeightInformation.asNumber;
};
