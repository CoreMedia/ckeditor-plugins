import Command from "@ckeditor/ckeditor5-core/src/command";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import first from "@ckeditor/ckeditor5-utils/src/first";
import { isImageAllowed } from "@ckeditor/ckeditor5-link/src/utils";
import { LINK_TARGET_MODEL } from "./Constants";
import findAttributeRange from "@ckeditor/ckeditor5-typing/src/utils/findattributerange";
import toMap from "@ckeditor/ckeditor5-utils/src/tomap";
import Range from "@ckeditor/ckeditor5-engine/src/model/range";

/**
 * Extension to `LinkCommand` which takes care of setting the `linkTarget`
 * attribute according to settings in dialog.
 *
 * **Note:** This command should not be executed without the `LinkCommand`
 * being executed, as it will generate anchors with `target` but without
 * `href` attribute.
 */
export default class LinkTargetCommand extends Command {
  constructor(editor: Editor) {
    super(editor);
  }

  refresh(): void {
    // This implementation is strongly related to the LinkCommand implementation
    // of CKEditor Link Plugin. It may make sense, to review the code from time
    // to time.
    const model = this.editor.model;
    const doc = model.document;

    const selectedElement = first(doc.selection.getSelectedBlocks());

    if (isImageAllowed(selectedElement, model.schema)) {
      this.value = selectedElement.getAttribute(LINK_TARGET_MODEL);
      this.isEnabled = model.schema.checkAttribute(selectedElement, LINK_TARGET_MODEL);
    } else {
      this.value = doc.selection.getAttribute(LINK_TARGET_MODEL);
      this.isEnabled = model.schema.checkAttributeInSelection(doc.selection, LINK_TARGET_MODEL);
    }
  }

  execute(target: string): void {
    // This implementation is strongly related to the LinkCommand implementation
    // of CKEditor Link Plugin. It may make sense, to review the code from time
    // to time.

    const model = this.editor.model;
    const selection = model.document.selection;

    model.change((writer) => {
      // If selection is collapsed then update selected link or insert new one at the place of caret.
      if (selection.isCollapsed) {
        const position = selection.getFirstPosition();

        if (!position) {
          throw new Error("Illegal state. TODO");
        }

        // When selection is inside text with `linkHref` attribute.
        if (selection.hasAttribute(LINK_TARGET_MODEL)) {
          // Then update `linkHref` value.
          const linkRange = findAttributeRange(
            position,
            LINK_TARGET_MODEL,
            selection.getAttribute(LINK_TARGET_MODEL),
            model
          );

          writer.setAttribute(LINK_TARGET_MODEL, target, linkRange);

          // Put the selection at the end of the updated link.
          // TODO[cke] The LinkCommand does the same... do we want to repeat it here?
          const nodeBefore = linkRange.end.nodeBefore;

          if (!nodeBefore) {
            throw new Error("Illegal state. TODO");
          }

          writer.setSelection(writer.createPositionAfter(nodeBefore));
        } else if (target !== "") {
          // If not then insert text node with `linkHref` attribute in place of caret.
          // However, since selection is collapsed, attribute value will be used as data for text node.
          // So, if `href` is empty, do not create text node.
          const attributes = toMap(selection.getAttributes());

          attributes.set(LINK_TARGET_MODEL, target);

          // We should not reach this state, as the `LinkCommand` should have
          // generated some link already. The default behavior of the `LinkCommand`
          // without having a selection, is to insert the href as text.
          //
          // For this to happen, we must ensure, that we run **after** the
          // `LinkCommand` always.
          //
          // For now, in any case, the `LinkCommand` did not do what is required
          // we still behave in the very same way, i.e., we add our target text
          // just as plain text.
          const { end: positionAfter } = model.insertContent(writer.createText(target, attributes), position);

          // Put the selection at the end of the inserted link.
          // Using end of range returned from insertContent in case nodes with the same attributes got merged.
          writer.setSelection(positionAfter);
        }

        // Remove the `linkTarget` attribute from the selection.
        // It stops adding a new content into the link element.
        writer.removeSelectionAttribute(LINK_TARGET_MODEL);
      } else {
        // If selection has non-collapsed ranges, we change attribute on nodes inside those ranges
        // omitting nodes where the `linkTarget` attribute is disallowed.
        const ranges: Range[] = Array.from(model.schema.getValidRanges(selection.getRanges(), LINK_TARGET_MODEL));

        // But for the first, check whether the `linkTarget` attribute is allowed on selected blocks (e.g. the "image" element).
        const allowedRanges: Range[] = [];

        for (const element of selection.getSelectedBlocks()) {
          if (model.schema.checkAttribute(element, LINK_TARGET_MODEL)) {
            allowedRanges.push(writer.createRangeOn(element));
          }
        }

        // Ranges that accept the `linkTarget` attribute. Since we will iterate over `allowedRanges`, let's clone it.
        const rangesToUpdate = allowedRanges.slice();

        // For all selection ranges we want to check whether given range is inside an element that accepts the `linkTarget` attribute.
        // If so, we don't want to propagate applying the attribute to its children.
        for (const range of ranges) {
          if (LinkTargetCommand._isRangeToUpdate(range, allowedRanges)) {
            rangesToUpdate.push(range);
          }
        }

        for (const range of rangesToUpdate) {
          writer.setAttribute(LINK_TARGET_MODEL, target, range);
        }
      }
    });
  }

  /**
   * Checks whether specified `range` is inside an element that accepts the `linkTarget` attribute.
   */
  private static _isRangeToUpdate(range: Range, allowedRanges: Array<Range>): boolean {
    for (const allowedRange of allowedRanges) {
      // A range is inside an element that will have the `linkTarget` attribute. Do not modify its nodes.
      if (allowedRange.containsRange(range)) {
        return false;
      }
    }

    return true;
  }
}
