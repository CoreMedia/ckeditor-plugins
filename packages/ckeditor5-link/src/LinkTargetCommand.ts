import Command from "@ckeditor/ckeditor5-core/src/command";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import first from "@ckeditor/ckeditor5-utils/src/first";
import { isImageAllowed } from "@ckeditor/ckeditor5-link/src/utils";
import { LINK_TARGET_MODEL } from "./Constants";
import { DiffItem, DiffItemAttribute, DiffItemInsert } from "@ckeditor/ckeditor5-engine/src/model/differ";
import Writer from "@ckeditor/ckeditor5-engine/src/model/writer";
import Range from "@ckeditor/ckeditor5-engine/src/model/range";
import { Logger, LoggerProvider } from "@coremedia/coremedia-utils/index";
import Selection from "@ckeditor/ckeditor5-engine/src/model/selection";

/**
 * Extension to `LinkCommand` which takes care of setting the `linkTarget`
 * attribute according to settings in dialog.
 *
 * **Note:** This command should not be executed without the `LinkCommand`
 * being executed, as it will generate anchors with `target` but without
 * `href` attribute.
 */
export default class LinkTargetCommand extends Command {
  private readonly logger: Logger = LoggerProvider.getLogger("LinkTargetCommand");
  private postFixEnabled = false;
  private nextTarget: string | "" | null = null;

  constructor(editor: Editor) {
    super(editor);

    const model = editor.model;
    const document = model.document;
    document.registerPostFixer((writer) => this.updateTargetOnLinkHref(writer));
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

  execute(target: string | "" | null): void {
    const editor = this.editor;
    const linkCommand = editor.commands.get("link");

    if (!linkCommand) {
      this.logger.warn("Cannot execute: Required LinkCommand not available.");
      return;
    }

    this.nextTarget = target;
    /*
     * We must listen to several events triggered by `LinkCommand` on model
     * change, so that we have to keep up listening until the command is done.
     */
    this.postFixEnabled = true;

    linkCommand.once("execute", () => {
      // LinkCommand execution is done. Let's stop applying post-fixes.
      this.postFixEnabled = false;
    });
  }

  destroy(): void {
    super.destroy();
    /*
     * We cannot remove post-fixers, but we should at least disable this one.
     */
    this.postFixEnabled = false;
  }

  /**
   * A post-fixer which will "listen" to changes triggered by
   * `LinkCommand` to set (or remove) the target attribute from the
   * model. The target value to set must have been set by
   * `execute` method before.
   *
   * @param writer model writer to get changes from and apply changes to
   * @private
   * @return `true`, if changes got applied; `false` otherwise
   */
  private updateTargetOnLinkHref(writer: Writer): boolean {
    if (!this.postFixEnabled) {
      // We are currently not active (not working on LinkCommand). Let's just return.
      return false;
    }

    const target = this.nextTarget;
    const model = writer.model;
    const linkHrefRangeCandidates = model.document.differ.getChanges().map((di) => toLinkHrefRange(writer, di));
    const linkHrefRanges = linkHrefRangeCandidates.filter((v) => !!v) as Range[];
    const validRanges = Array.from(model.schema.getValidRanges(linkHrefRanges, LINK_TARGET_MODEL));

    /*
     * Todo[cke]
     *   * We need to be aware of changes only to the target, which means, that we will get
     *     no diff-item from LinkCommand. This means, that we have to determine the ranges on
     *     ourselves.
     */

    // Workaround for missing feature ckeditor/ckeditor5#9627
    const operationsBefore = writer.batch.operations.length;

    if (!target) {
      validRanges.forEach((range) => writer.removeAttribute(LINK_TARGET_MODEL, range));
    } else {
      validRanges.forEach((range) => writer.setAttribute(LINK_TARGET_MODEL, target, range));
    }

    const operationsAfter = writer.batch.operations.length;

    return operationsBefore !== operationsAfter;
  }
}

/**
 * Return affected range if a `DiffItem` comes with a `linkHref` attribute set
 * or changed.
 *
 * @param writer writer instance
 * @param diffItem item to check for `linkHref` attribute
 * @return affected range, or `null` if the item is not related to a `linkHref` change
 */
function toLinkHrefRange(writer: Writer, diffItem: DiffItem): Range | null {
  if (diffItem.type === "attribute") {
    const diffItemAttribute: DiffItemAttribute = <DiffItemAttribute>diffItem;
    if (diffItemAttribute.attributeKey !== "linkHref") {
      return null;
    }
    return diffItemAttribute.range;
  } else if (diffItem.type === "insert") {
    const diffItemInsert: DiffItemInsert = <DiffItemInsert>diffItem;
    if (diffItemInsert.name !== "$text") {
      // Only "createText" events are relevant to us. This is triggered,
      // when a link got added in a collapsed selection. The text is then
      // the same as the added linkHref attribute.
      return null;
    }
    // Now let's see, if a linkHref attribute got added.
    // If yes, this is the range we want to add the target attribute to.
    const start = diffItemInsert.position;
    const end = start.getShiftedBy(diffItemInsert.length);
    const range = writer.createRange(start, end);
    const selection: Selection = writer.createSelection(range);
    const selectedContent = writer.model.getSelectedContent(selection);
    const linkHref = selectedContent.getChild(0)?.getAttribute("linkHref");
    if (!!linkHref) {
      return range;
    }
  }
  return null;
}
