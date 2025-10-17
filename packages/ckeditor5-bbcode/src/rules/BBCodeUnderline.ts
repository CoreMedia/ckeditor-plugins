import type { BBCodeProcessingRule } from "./BBCodeProcessingRule";

/**
 * HTML Elements that may denote a "underline" state.
 */
const underlineTags = ["u", "ins"];

/**
 * Rule that maps `<u>` to `[u]`.
 *
 * While `<u>` is nowadays used to express _unarticulated annotation_,
 * CKEditor's _underline_ command still uses `<u>` in view layers. If this
 * changes, mappings may need to be adjusted.
 */
export class BBCodeUnderline implements BBCodeProcessingRule {
  readonly id = "underline";
  readonly tags = ["u"];
  toData(element: HTMLElement, content: string): undefined | string {
    const { tagName, style } = element;
    const { textDecoration } = style;
    let underline = underlineTags.includes(tagName.toLowerCase());

    // Possibly veto underline by name or enable underline by
    // style option rather than by tag.
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

    return undefined;
  }
}

/**
 * Rule instance that maps `<u>` to `[u]`.
 */
export const bbCodeUnderline = new BBCodeUnderline();
