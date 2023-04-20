import {
  extractXLinkAttributes,
  extractXLinkDataSetEntries,
  setXLinkAttributes,
  setXLinkDataSetEntries,
} from "./XLink";
import { RuleConfig } from "@coremedia/ckeditor5-dom-converter/Rule";
import { isHTMLImageElement } from "@coremedia/ckeditor5-dom-support/HTMLImageElements";
import { isElement } from "@coremedia/ckeditor5-dom-support/Elements";
import { namespaces } from "../Namespaces";

/**
 * Placeholder for images when CoreMedia ContentImagePlugin is not enabled.
 * The placeholder is a grey PNG image.
 */
export const INLINE_IMG =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAO0AAABoCAMAAAAq7ofWAAAA5FBMVEXl5eXg4ODJycnQ0NCKioqCgoKfn5+AgICDg4Otra3j4+O9vb3ExMSFhYWdnZ3f39+5ubmOjo6JiYmBgYGenp7GxsaGhoa+vr6RkZG1tbWoqKjDw8O7u7uPj4+4uLiUlJSpqamZmZnPz8+ampra2tre3t7V1dWXl5e3t7fi4uKhoaHc3NysrKyzs7O/v7/k5OSTk5PIyMiEhITLy8vMzMzAwMDd3d2lpaWcnJyMjIyNjY3S0tKxsbHY2NiIiIirq6u6urqkpKS0tLTZ2dmurq68vLzb29uWlpbCwsKLi4u2trbT09NF2z01AAABsUlEQVR4nO3WW1fTQBSG4V3p+LWVtpQeCFKgVLFKgNKKnDTWAyLq//8/zmRQ72ldWSvrfW5mJsnF/lYyk20GAAAAAAAAAAAAAAAAAAAeq/JkrVJ0DatTdWZPVYuLuhSGhtOzeGG9Ka/VNttQ1Cmq0JXY7Jr1pH6+GMS0W1KSr7flnu8Md9Vp2J72R8FGcaWuwEPagzAfK6ZN3Au99ONht/YqrCfa8WlfF1jlqsS0+903fn6kJKRN1err2E9GOsmfGW/WS5X2VEOzqTubhLR1zaau6SeJ/h1QZUqbzv1GXddWnnZQC5femjX9CWbndW/o00bvii54KTHtxaVSm3QbIe25rtL0VC2zeTiqj0PGa5/2phWMiy54KQ9p3+tDpXtlIW0vvkS/kzvyu7mdZZm7LtWXfGEfq3uahbQNN194iT7ZZ33Jn/mqsqW9VXMe/jX2LT+Obc33EXfxDzT9Xrq0d9JlnjZRlt8Y+PFEbnS//SPu27O8u/hZcL3LCZ1jT4dmu/oV0qZ/esOFFmb90Dm6+6Obv51jtdhy/7P2LCu6BAAAAAAAAAAAAAAAAAAAAAB4pN9v+SLwroRK9gAAAABJRU5ErkJggg==";

export const imageElements: RuleConfig = {
  id: `transform-image-element-attributes-bijective`,
  toData: {
    id: `toData-transform-image-element-attributes`,
    // Do early, to benefit from richer HTML API.
    prepare: (node): void => {
      if (isHTMLImageElement(node)) {
        setXLinkAttributes(node, extractXLinkDataSetEntries(node));
        // Ensure that alt attribute is set as required in data.
        node.alt = node.alt ?? "";
        // src attribute only contains a link to some displayable blob and
        // is not meant to be stored in data. Blob references are stored
        // in xlink:href, which are tracked separately.
        node.removeAttribute("src");
        // title: The title is used to provide a tooltip for the linked
        // image content. It should not even occur on the data-processing layer.
        // The xlink:title instead is stored in data-xlink-title handled
        // above in setXLinkAttributes.
        node.removeAttribute("title");
      }
    },

    imported: (node, { api }): Node => {
      if (!isElement(node) || node.localName !== "img") {
        return node;
      }
      if (!node.getAttributeNS(namespaces.xlink, "href")) {
        // Prevent image missing required reference to content Blob, thus,
        // removing it.
        return api.createDocumentFragment();
      }
      return node;
    },
  },

  toView: {
    id: `toView-transform-image-element-attributes`,
    imported: (node): Node => {
      if (isHTMLImageElement(node)) {
        // title: Not mapping xlink:title to title yet, as we use the title
        // for generating tooltips regarding the related content.
        setXLinkDataSetEntries(node, extractXLinkAttributes(node));
        node.src = INLINE_IMG;
      }
      return node;
    },
  },
};
