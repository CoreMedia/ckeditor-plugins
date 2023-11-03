import { BBCodeProcessingRule } from "./BBCodeProcessingRule";

const strikethroughTags = ["strike", "s", "del"];

/**
 * Maps `<s>` to `[s]`.
 */
export class BBCodeStrikethrough implements BBCodeProcessingRule {
  readonly id = "strikethrough";
  readonly tags = ["s"];
  toData(element: HTMLElement, content: string): undefined | string {
    const { tagName, style } = element;
    const { textDecoration } = style;
    let strikethrough = strikethroughTags.includes(tagName.toLowerCase());

    if (textDecoration) {
      const normalizedTextDecoration = textDecoration.trim().toLowerCase();
      if (normalizedTextDecoration.includes("line-through")) {
        strikethrough = true;
      } else if (normalizedTextDecoration === "none") {
        strikethrough = false;
      }
    }

    if (strikethrough) {
      // If it existed: We parsed it, no need for others to respect it.
      style.textDecoration = "";
      return `[s]${content}[/s]`;
    }

    return undefined;
  }
}

export const bbCodeStrikethrough = new BBCodeStrikethrough();
