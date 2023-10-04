import { HTML2BBCodeRule } from "./HTML2BBCodeRule";

const underlineTags = ["u", "ins"];

/**
 * Maps `<u>` to `[u]`.
 *
 * While `<u>` is nowadays used to express _unarticulated annotation_,
 * CKEditor's _underline_ command still uses `<u>` in view layers. If this
 * changes, mappings need to be adjusted.
 */
export const underlineRule: HTML2BBCodeRule = {
  id: "u",
  process(taggedElement): void {
    const { element } = taggedElement;
    const {
      tagName,
      style: { textDecoration },
    } = element;
    if (textDecoration === "none") {
      // Vetoes any possible underline.
      return;
    }
    if (textDecoration.includes("underline") || underlineTags.includes(tagName.toLowerCase())) {
      taggedElement.underline = true;
    }
  },
  transform(taggedElement, content): string {
    const { underline } = taggedElement;
    return underline ? `[u]${content}[/u]` : content;
  },
};
