import { BBCodeProcessingRule } from "./BBCodeProcessingRule";
import { bbCodeLogger } from "../BBCodeLogger";

const isSupportedColor = (color: string) => /^(\w+|#[a-f0-9]{3}|#[a-f0-9]{6})$/.test(color);

const parseColor = (style: string): string =>
  style.replace(/(?:^|.*;\s*)color:\s*(\w+|#[a-f0-9]{3}|#[a-f0-9]{6})(?:\s*;.*$|$)/, "$1");

/**
 * Maps `color` style to `[color]`.
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
      const unparsedStyle = element.getAttribute("style");
      const unparsedColor = parseColor(unparsedStyle ?? "");
      if (isSupportedColor(unparsedColor)) {
        // Mark as parsed (thus, remove it)
        style.removeProperty("color");
        return `[color=${unparsedColor}]${content}[/color]`;
      } else {
        logger.debug(
          `Skipped unsupported color format: ${unparsedColor}. Color must be color name or valid hex-color string.`,
        );
      }
    }
  }
}

export const bbCodeColor = new BBCodeColor();
