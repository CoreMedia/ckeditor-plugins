import { BBCodeProcessingRule } from "./BBCodeProcessingRule";
import { getColor, RgbColor } from "@coremedia/ckeditor5-dom-support";

/**
 * Maps a color to a representation suitable as unique argument to the
 * `[color]` tag.
 *
 * If the mapper returns `undefined` (or empty string), no `[color]` tag will be
 * created.
 *
 * One possible example for such a color mapper is mapping hex color codes
 * to color names or even vice versa.
 */
export type ColorMapper = (color: string | RgbColor) => string | undefined;

/**
 * Color-mapper that prefers color names over hex- (or hex-alpha)
 * representation. Thus, strings are returned as is, while `RgbColor`
 * is transformed via `toColorNameOrHex()`.
 *
 * @param color - color to map to string
 */
export const defaultColorMapper: ColorMapper = (color: string | RgbColor): string => {
  if (typeof color === "string") {
    return color;
  }
  return color.toColorNameOrHex();
};

/**
 * Configuration for `BBCodeColor`.
 */
export interface BBCodeColorConfig {
  /**
   * Used for mapping detected colors to a representation suitable for
   * use in `[color]` tag.
   */
  mapper?: ColorMapper;
}

/**
 * Processing rule for transforming a color style represented in HTML
 * (by `color` style) to `[color=#ff0000]Text[/color]` in BBCode.
 *
 * Due to the behavior of `CSSStyleDeclaration` color formats such as
 * `rgb()`, `rgba()` or `hsl()` are supported as well and will all be
 * transformed to hex or hex-alpha representation.
 */
export class BBCodeColor implements BBCodeProcessingRule {
  readonly id = "color";
  readonly tags = ["color"];

  readonly #mapper: ColorMapper;

  /**
   * Constructor with possible configuration options.
   * @param config - configuration options
   */
  constructor(config: BBCodeColorConfig = {}) {
    const { mapper = defaultColorMapper } = config;
    this.#mapper = mapper;
  }

  toData(element: HTMLElement, content: string): undefined | string {
    const { style } = element;
    const color = getColor(style);

    if (color) {
      style.removeProperty("color");
      const mappedColor = this.#mapper(color);
      if (mappedColor) {
        return `[color=${mappedColor}]${content}[/color]`;
      }
    }

    return undefined;
  }
}

/**
 * Processing rule instance for transforming a color style represented in HTML
 * (by `color` style) to `[color=#ff0000]Text[/color]` in BBCode.
 *
 * Due to the behavior of `CSSStyleDeclaration` color formats such as
 * `rgb()`, `rgba()` or `hsl()` are supported as well and will all be
 * transformed to hex or hex-alpha representation.
 */
export const bbCodeColor = new BBCodeColor();
