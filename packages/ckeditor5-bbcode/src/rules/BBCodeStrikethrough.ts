import type { BBCodeProcessingRule } from "./BBCodeProcessingRule";

/**
 * HTML Elements that may denote a "strike-through" state.
 */
const strikethroughTags = ["strike", "s", "del"];

/**
 * Rule that maps `<s>` to `[s]`.
 */
export class BBCodeStrikethrough implements BBCodeProcessingRule {
  readonly id = "strikethrough";
  readonly tags = ["s"];
  toData(element: HTMLElement, content: string): undefined | string {
    const { tagName, style } = element;
    const { textDecoration } = style;
    let strikethrough = strikethroughTags.includes(tagName.toLowerCase());

    // Possibly veto strikethrough by name or enable strike-through by
    // style option rather than by tag.
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

/**
 * Rule instance that maps `<s>` to `[s]`.
 */
export const bbCodeStrikethrough = new BBCodeStrikethrough();
