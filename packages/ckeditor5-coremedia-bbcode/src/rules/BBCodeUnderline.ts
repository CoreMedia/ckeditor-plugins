import { BBCodeProcessingRule } from "./BBCodeProcessingRule";

const underlineTags = ["u", "ins"];

/**
 * Maps `<u>` to `[u]`.
 *
 * While `<u>` is nowadays used to express _unarticulated annotation_,
 * CKEditor's _underline_ command still uses `<u>` in view layers. If this
 * changes, mappings need to be adjusted.
 */
export class BBCodeUnderline implements BBCodeProcessingRule {
  readonly id = "underline";
  readonly tags = ["u"];
  toData(element: HTMLElement, content: string): undefined | string {
    const { tagName, style } = element;
    const { textDecoration } = style;
    let underline = underlineTags.includes(tagName.toLowerCase());

    if (textDecoration) {
      const normalizedTextDecoration = textDecoration.trim().toLowerCase();
      if (normalizedTextDecoration.includes("underline")) {
        underline = true;
      } else if (normalizedTextDecoration === "none") {
        underline = false;
      }
    }

    if (underline) {
      // If it existed: We parsed it, no need for others to respect it.
      style.textDecoration = "";
      return `[u]${content}[/u]`;
    }
  }
}

export const bbCodeUnderline = new BBCodeUnderline();
