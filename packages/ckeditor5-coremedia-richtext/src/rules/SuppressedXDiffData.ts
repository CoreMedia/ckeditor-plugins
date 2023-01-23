import { RuleConfig } from "@coremedia/ckeditor5-dom-converter/Rule";
import { isElement } from "@coremedia/ckeditor5-dom-support/Elements";

/**
 * Elements of `xdiff` namespace should not make it into data. Thus, on data
 * processing, we are removing them. They are expected to be part of a false
 * configuration, as in general `xdiff` data should not occur in editable
 * CKEditor's (thus, only in read-only mode).
 *
 * Note, that this configuration is meant to move to `Differencing` plugin
 * soon.
 */
export const supppressedXDiffData: RuleConfig = {
  toData: {
    id: `remove-xdiff-data`,
    imported: (node, { api }): Node => {
      if (!isElement(node)) {
        return node;
      }
      if (node.prefix === "xdiff" || node.localName.startsWith("xdiff:")) {
        // Node will be replaced by children.
        return api.createDocumentFragment();
      }
      for (const attribute of node.attributes) {
        if (attribute.prefix === "xdiff" || attribute.localName.startsWith("xdiff:")) {
          node.removeAttributeNode(attribute);
        }
      }
      return node;
    },
  },
};
