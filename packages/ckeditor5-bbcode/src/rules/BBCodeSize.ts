import type { FontSizeConfiguration } from "../utils/FontSizes";
import { fontSizes, normalSize } from "../utils/FontSizes";
import type { BBCodeProcessingRule } from "./BBCodeProcessingRule";

/**
 * Tries to find an applicable font-size configuration for the given element.
 *
 * @param element - element to try to get the font-size for
 */
const findFontSize = (element: HTMLElement): FontSizeConfiguration | undefined => {
  const { classList } = element;
  return fontSizes.find((config) => classList.contains(config.className));
};

/**
 * Processing rule for transforming a font-size style represented in HTML
 * to `[size=24]Text[/size]` in BBCode.
 */
export class BBCodeSize implements BBCodeProcessingRule {
  readonly id = "size";
  readonly tags = ["size"];

  toData(element: HTMLElement, content: string): undefined | string {
    const fontSize = findFontSize(element);

    if (fontSize) {
      const nSize = fontSize.numeric;
      if (nSize !== normalSize) {
        return `[size=${nSize}]${content}[/size]`;
      }
    }

    return undefined;
  }
}

/**
 * Processing rule instance for transforming a font-size style represented in
 * HTML to `[size=24]Text[/size]` in BBCode.
 */
export const bbCodeSize = new BBCodeSize();
