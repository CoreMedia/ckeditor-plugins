import { BBCodeProcessingRule } from "./BBCodeProcessingRule";
import { bbCodeLogger } from "../BBCodeLogger";

/**
 * The parsing pattern is meant to accept well-known color names as well as
 * typical hex codes denoting a color, such as `#ff0000` or `#ccc`. The only
 * existing matching group `$1` will contain the matched color code.
 *
 * The following style values will match and provide a color code in group 1:
 *
 * ```text
 * color: #ff0000;
 * color: #FF0000;
 * color: #ff0000
 * color: #ccc;
 * color: fuchsia;
 * font-weight: bold; color: red; font-style: italic;
 * ```
 */
const colorStylePattern = /(?:^|.*;\s*)color:\s*(\w+|#[a-f0-9]{3}|#[a-f0-9]{6})(?:\s*;.*$|$)/i;

/**
 * Parses a supported color representation for transforming it into BBCode.
 * The method is meant to receive the whole style attribute value as string,
 * as in higher level API (thus, using `CSSStyleDeclaration.color`) may or will
 * already contain a parsed color format as RGB, that would need extra
 * transformation for BBCode. Instead, the `style` attribute value itself
 * will contain the color code, as it got set within CKEditor 5 without
 * additional magic applied.
 */
const parseStyleColor = (style: string): string | undefined => {
  const match = colorStylePattern.exec(style);
  if (!match) {
    return undefined;
  }
  return match[1];
};

/**
 * Processing rule for transforming a color style represented in HTML
 * (by `color` style) to `[color=#ff0000]Text[/color]` in BBCode.
 *
 * The rule only accepts colors as color codes or as color names and ignores
 * all others.
 */
export class BBCodeColor implements BBCodeProcessingRule {
  readonly id = "color";
  readonly tags = ["color"];
  toData(element: HTMLElement, content: string): undefined | string {
    const logger = bbCodeLogger;
    const { style } = element;
    // This is the already parsed color rgb() by default. We only support
    // color names and hex-codes. For convenience, we use the parsed string to
    // see if there is any color at all.
    const { color } = style;

    if (color) {
      const unparsedStyle = element.getAttribute("style") ?? "";
      const parsedColor = parseStyleColor(unparsedStyle);
      if (parsedColor) {
        // Mark as parsed (thus, remove it)
        style.removeProperty("color");
        return `[color=${parsedColor}]${content}[/color]`;
      } else {
        logger.debug(
          `Skipped unsupported format for color in style attribute: ${unparsedStyle}. Color must be color name or valid hex-color string.`,
        );
      }
    }
  }
}

/**
 * Processing rule instance for transforming a color style represented in HTML
 * (by `color` style) to `[color=#ff0000]Text[/color]` in BBCode.
 *
 * The rule only accepts colors as color codes or as color names and ignores
 * all others.
 */
export const bbCodeColor = new BBCodeColor();
