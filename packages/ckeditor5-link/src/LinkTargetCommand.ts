import Command from "@ckeditor/ckeditor5-core/src/command";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import first from "@ckeditor/ckeditor5-utils/src/first";
import { isImageAllowed } from "@ckeditor/ckeditor5-link/src/utils";
import { LINK_COMMAND_NAME, LINK_TARGET_MODEL } from "./Constants";
import { DiffItem, DiffItemAttribute, DiffItemInsert } from "@ckeditor/ckeditor5-engine/src/model/differ";
import Writer from "@ckeditor/ckeditor5-engine/src/model/writer";
import Range from "@ckeditor/ckeditor5-engine/src/model/range";
import { Logger, LoggerProvider } from "@coremedia/coremedia-utils/index";
import Selection from "@ckeditor/ckeditor5-engine/src/model/selection";
import findAttributeRange from "@ckeditor/ckeditor5-typing/src/utils/findattributerange";
import Position from "@ckeditor/ckeditor5-engine/src/model/position";

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
  /**
   * Toggles, if post-fix should be applied or not.
   * @private
   */
  private postFixEnabled = false;
  /**
   * Toggles, if writer.removeSelectionAttribute should be called once
   * LinkCommand is done.
   * @private
   */
  private removeSelectionAttribute = false;
  private nextTarget: string | "" | null = null;

  constructor(editor: Editor) {
    super(editor);

    const model = editor.model;
    const document = model.document;
    document.registerPostFixer((writer) => this._updateTargetOnLinkHref(writer));
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

  /**
   * Execute LinkTargetCommand.
   * @param target target to apply
   * @param href href for reference from dialog; used to distinguish some
   * behaviors triggered by `LinkCommand`.
   */
  execute(target: string | "" | null, href: string | "" | null): void {
    const editor = this.editor;
    const linkCommand = editor.commands.get(LINK_COMMAND_NAME);

    const model = editor.model;
    const selection = model.document.selection;

    model.change((writer) => {
      if (selection.isCollapsed) {
        this._handleCollapsedSelection(writer, target, href, linkCommand);
      } else {
        this._handleExpandedSelection(writer, target);
      }
    });

    this.nextTarget = target;
    /*
     * We must listen to several events triggered by `LinkCommand` on model
     * change, so that we have to keep up listening until the command is done.
     * But we only need to do that, if the linkCommand is available.
     */
    this.postFixEnabled = !!linkCommand;

    linkCommand?.once("execute", () => {
      // LinkCommand execution is done. Let's stop applying post-fixes.
      this.postFixEnabled = false;
    });
  }

  /**
   * If the selection is expanded (i.e. text is actually selected), we need to
   * update all valid ranges with the target attribute.
   *
   * Copy & Paste from LinkCommand:
   *
   * Note, that this code is very similar to the `LinkCommand` execution
   * as the command does not provide appropriate extension points yet
   * (see https://github.com/ckeditor/ckeditor5/issues/9730). On each update
   * it should be checked, if the corresponding implementation changed in
   * a way, that requires to adapt the following code.
   */
  private _handleExpandedSelection(writer: Writer, target: string | "" | null) {
    const editor = this.editor;
    const model = editor.model;
    const selection = model.document.selection;
    const ranges = model.schema.getValidRanges(selection.getRanges(), LINK_TARGET_MODEL);
    const allowedRanges = [];
    for (const element of selection.getSelectedBlocks()) {
      if (model.schema.checkAttribute(element, LINK_TARGET_MODEL)) {
        allowedRanges.push(writer.createRangeOn(element));
      }
    }
    const rangesToUpdate = allowedRanges.slice();
    for (const range of ranges) {
      if (LinkTargetCommand._isRangeToUpdate(range, allowedRanges)) {
        rangesToUpdate.push(range);
      }
    }
    for (const range of rangesToUpdate) {
      this._setOrRemoveAttribute(writer, target, range);
    }
  }

  /**
   * If the selection is collapsed (i.e. we are at cursor-position having
   * nothing selected), we are possibly going to modify an already existing
   * `linkTarget`.
   *
   * Copy & Paste from LinkCommand:
   *
   * Note, that this code is very similar to the `LinkCommand` execution
   * as the command does not provide appropriate extension points yet
   * (see https://github.com/ckeditor/ckeditor5/issues/9730). On each update
   * it should be checked, if the corresponding implementation changed in
   * a way, that requires to adapt the following code.
   * @private
   */
  private _handleCollapsedSelection(
    writer: Writer,
    target: string | "" | null,
    href: string | "" | null,
    linkCommand: Command | undefined
  ) {
    const editor = this.editor;
    const model = editor.model;
    const selection = model.document.selection;
    // LinkCommand does not check for possible null value, so don't we.
    const position: Position = <Position>selection.getFirstPosition();

    const hasLinkTarget = selection.hasAttribute(LINK_TARGET_MODEL);
    const hasLinkHref = selection.hasAttribute("linkHref");

    if (hasLinkTarget || hasLinkHref) {
      const referenceAttribute = hasLinkTarget ? LINK_TARGET_MODEL : "linkHref";
      /*
       * We have to determine the range based on either linkTarget or
       * linkHref. If linkTarget has not been set yet, we assume, that
       * the target shall be applied to the same range as we will apply
       * linkHref to.
       */
      const linkRange = findAttributeRange(
        position,
        referenceAttribute,
        selection.getAttribute(referenceAttribute),
        model
      );
      this._setOrRemoveAttribute(writer, target, linkRange);
    } else if (!!target) {
      /*
       * Only set the target, if it is not empty. We already know at this
       * point, that the current selection has no `linkHref` attribute
       * set, which leaves two possible states we need to handle:
       *
       *
       * TL;DR: Always call `writer.removeSelectionAttribute` after
       * execution of link-command, but only set the attribute if
       * linkHref is not empty.
       *
       * linkHref !== ''
       *
       *     This will cause `LinkCommand` to add a text containing linkHref.
       *     As `LinkCommand` link command will take over the attributes from
       *     the selection, we can add the target to the selection (because
       *     this will/must run before `LinkCommand`). Doing so, requires
       *     to manually trigger `writer.removeSelectionAttribute` after
       *     `LinkCommand` got executed.
       *
       * linkHref == ''
       *
       *     `LinkCommand` won't create any text and won't apply any
       *     attributes. Thus, we must not add `linkTarget` attribute,
       *     as there would be no UI to editor this orphaned `LinkTarget`.
       *     But just as `LinkCommand` we should ensure to call
       *     `writer.removeSelectionAttribute`.
       */
      if (!!href && !!linkCommand) {
        // This will tell link-command that it should take these
        // attributes when creating the text.
        writer.setSelectionAttribute(LINK_TARGET_MODEL, target);
        this.removeSelectionAttribute = true;
      }
    }
  }

  /**
   * Depending if the target is empty or not, the attribute is either removed
   * from the given range or set.
   * @private
   */
  private _setOrRemoveAttribute(writer: Writer, target: string | "" | null, range: Range) {
    // If we empty the target, we just want to remove it.
    if (!target) {
      // May remove `linkTarget` attribute, where there isn't any. But
      // this does no harm. The following command will just do nothing.
      writer.removeAttribute(LINK_TARGET_MODEL, range);
    } else {
      // May set the very same value as already set. Just as for
      // removal: Won't do any action, if the target attribute did
      // not change.
      writer.setAttribute(LINK_TARGET_MODEL, target, range);
    }
  }

  /**
   * Checks whether specified `range` is inside an element that accepts the `linkTarget` attribute.
   *
   * @private
   * @param range A range to check.
   * @param allowedRanges An array of ranges created on elements where the attribute is accepted.
   * @returns {Boolean}
   */
  private static _isRangeToUpdate(range: Range, allowedRanges: Range[]): boolean {
    for (const allowedRange of allowedRanges) {
      // A range is inside an element that will have the `linkTarget` attribute. Do not modify its nodes.
      if (allowedRange.containsRange(range)) {
        return false;
      }
    }

    return true;
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
  private _updateTargetOnLinkHref(writer: Writer): boolean {
    // Note on parallel changes: You may observe infinite iterations when this
    // post-fixer clashes with the post-fixer for `linkHref` removal in
    // `LinkTargetModelView`. So, be aware, that both post-fixers may run on
    // the very same event and should not influence each other.

    if (!this.postFixEnabled) {
      // We are currently not active (not working on LinkCommand). Let's just return.
      return false;
    }

    if (this.removeSelectionAttribute) {
      writer.removeSelectionAttribute(LINK_TARGET_MODEL);
      // We only want to do this once, in case we get called multiple times
      // during post-fixing.
      this.removeSelectionAttribute = false;
    }

    if (true) {
      // TODO[cke] Currently nothing more todo on post-fixing despite removing
      //   the selection attribute. If we experience, that the current state
      //   produces two undo-steps, we need to activate post-processing again
      //   and apply attributes at all in here.
      return false;
    }
    const target = this.nextTarget;
    const model = writer.model;
    const document = model.document;
    const selection = document.selection;
    const linkHrefRangeCandidates = document.differ.getChanges().map((di) => toLinkHrefRange(writer, di));
    const linkHrefRanges = linkHrefRangeCandidates.filter((v) => !!v) as Range[];
    const validRanges = Array.from(model.schema.getValidRanges(linkHrefRanges, LINK_TARGET_MODEL));

    /*
     * Todo[cke]
     *   * We need to be aware of changes only to the target, which means, that we will get
     *     no diff-item from LinkCommand. This means, that we have to determine the ranges on
     *     ourselves.
     *
     *   Findings on behavior when linkHref did not change:
     *
     *     Collapsed Behavior:
     *
     *     • If any manual decorators got changed, we will have a change, but it is not related to linkHref.
     *     • If we are right within a link and we hit "submit" the cursor will jump to the end of the selection, no matter if linkHref changed or not.
     *
     *     Non-Collapsed Behavior:
     *     • Only attributes will be set without selection change.
     *
     *   Thus, we need to distinguish collapsed vs. non-collapsed on ourselves.
     */

    // Workaround for missing feature ckeditor/ckeditor5#9627
    const operationsBefore = writer.batch.operations.length;

    if (!target) {
      validRanges.forEach((range) => writer.removeAttribute(LINK_TARGET_MODEL, range));
    } else {
      validRanges.forEach((range) => writer.setAttribute(LINK_TARGET_MODEL, target, range));
    }

    const operationsAfter = writer.batch.operations.length;

    if (selection.isCollapsed) {
      // Nothing is selected (thus, we just edited at cursor position).
      // As a result, LinkCommand jumped to the end of the selection and
      // we should signal to stop adding `linkTarget` attributes when
      // we continue typing.
      writer.removeSelectionAttribute(LINK_TARGET_MODEL);
    }

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
