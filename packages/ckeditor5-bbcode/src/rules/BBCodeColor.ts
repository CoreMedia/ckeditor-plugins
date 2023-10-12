import { BBCodeProcessingRule } from "./BBCodeProcessingRule";
import { getColor } from "@coremedia/ckeditor5-dom-support";

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
    const { style } = element;
    const color = getColor(style);

    if (color) {
      style.removeProperty("color");
      let colorRepresentation: string;
      if (typeof color === "string") {
        colorRepresentation = color;
      } else {
        colorRepresentation = color.toHex();
      }
      return `[color=${colorRepresentation}]${content}[/color]`;
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
