import type { RuleConfig } from "@coremedia/ckeditor5-dom-converter";

const fixedAttributes = new Map<string, Map<string, string>>([
  ["pre", new Map([["xml:space", "preserve"]])],
  ["a", new Map([["xlink:type", "simple"]])],
  [
    "img",
    new Map([
      ["xlink:type", "simple"],
      ["xlink:show", "embed"],
      ["xlink:actuate", "onLoad"],
    ]),
  ],
]);

/**
 * RichTextSanitizer keeps an attribute with a valid fixed value.
 * If such an attribute should be removed before storing, then this rule can be used.
 * @example For an attribute with valid fixed value
 * ```html
 * <a href="" xlink:type="simple">
 * ```
 */
export const stripFixedAttributes = (): RuleConfig => ({
  toData: {
    id: "strip-fixed-attributes",
    prepare: (node: Node): void => {
      if (node instanceof HTMLElement) {
        if (Array.from(fixedAttributes.keys()).includes(node.localName)) {
          fixedAttributes.get(node.localName)?.forEach((value, attribute) => {
            if (node.hasAttribute(attribute) && node.getAttribute(attribute) === value) {
              node.removeAttribute(attribute);
            }
          });
        }
      }
    },
  },
  priority: "lowest",
});
