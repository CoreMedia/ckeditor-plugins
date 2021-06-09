import { ElementsFilterRuleSetConfiguration } from "@coremedia/ckeditor5-dataprocessor-support/Rules";
import { replaceByElementAndClassBackAndForth } from "./ReplaceBy";

export const tableRules: ElementsFilterRuleSetConfiguration = {
  td: (params) => {
    params.node.removeChildren = params.node.isEmpty((el, idx, children) => {
      // !Reverted logic! `true` signals, that the element should be considered,
      //   when judging on "is empty".

      // Only filter, if there is only one child. While it may be argued, if this
      // is useful, this is the behavior as we had it for CKEditor 4.
      if (children.length !== 1) {
        return true;
      }
      // If the element has more than one child node, the following rules don't apply.
      if (el.childNodes.length > 1) {
        return true;
      }

      // Ignore, if only one br exists.
      if (el.nodeName.toLowerCase() === "br") {
        return false;
      }
      // Next gate: Further analysis only required, if current element is <p>
      if (el.nodeName.toLowerCase() !== "p") {
        return true;
      }
      // Only respect p-element, if it is considered non-empty.
      // Because of the check above, we already know, that, the element
      // has at maximum one child.
      return el.hasChildNodes() && el.firstChild?.nodeName.toLowerCase() !== "br";
    });
  },
  th: replaceByElementAndClassBackAndForth("th", "td", "td--heading"),
  /*
   * tr/tables rules:
   * ----------------
   *
   * In CKEditor 4 we also had to handle tr and table which may have been
   * emptied during the process. This behavior moved to the after-children
   * behavior, which checks for elements which must not be empty but now
   * are empty.
   */
  tbody: (params) => {
    // If there are more elements at parent than just this tbody, tbody must
    // be removed. Typical scenario: Unknown element <thead> got removed, leaving
    // a structure like <table><tr/><tbody><tr/></tbody></table>. We must now move
    // all nested trs up one level and remove the tbody params.el.
    params.node.replaceByChildren = !params.node.singleton;
  },
};
