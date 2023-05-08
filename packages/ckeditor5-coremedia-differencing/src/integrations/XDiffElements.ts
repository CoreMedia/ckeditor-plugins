import { RuleConfig } from "@coremedia/ckeditor5-dom-converter/src/Rule";
import { isElement } from "@coremedia/ckeditor5-dom-support/src/Elements";
import { copyAttributesFrom } from "@coremedia/ckeditor5-dom-support/src/Attrs";
import { namespaces } from "@coremedia/ckeditor5-coremedia-richtext/src/Namespaces";

/**
 * Elements of `xdiff` namespace should not make it into data. Thus, on data
 * processing, we are removing them. They are expected to be part of a false
 * configuration, as in general `xdiff` data should not occur in editable
 * CKEditor's (thus, only in read-only mode).
 *
 * Regarding `toView` transformation, special care has to be taken of added
 * or removed newlines. As in editing view as well as in corresponding
 * CSS rules it is harder if not impossible to detect these, we handle them
 * during toView-processing and replace them by artificial element `<xdiff:br>`.
 *
 * Note, that this configuration is meant to move to `Differencing` plugin
 * soon.
 */
export const xDiffElements: RuleConfig = {
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
  toView: {
    id: `add-artificial-xdiff-br-for-newline-changes`,
    importedWithChildren: (node, { api }): Node => {
      if (
        !isElement(node) ||
        !node.localName.endsWith("span") ||
        (node.prefix !== "xdiff" && !node.localName.startsWith("xdiff:"))
      ) {
        return node;
      }
      // Later, in model, we cannot distinguish `<xdiff:span/>` representing
      // a newline (added, removed, changed) from `<xdiff:span> </xdiff:span>`
      // which is some whitespace change. Because of that, we introduce a
      // virtual new element here, which signals a newline change.
      if (node.childNodes.length === 0) {
        const br = api.createElementNS(namespaces.xdiff, "xdiff:br");
        copyAttributesFrom(node, br);
        return br;
      }
      return node;
    },
  },
};
