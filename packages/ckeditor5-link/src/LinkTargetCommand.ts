import Command from "@ckeditor/ckeditor5-core/src/command";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import first from "@ckeditor/ckeditor5-utils/src/first";
import { isImageAllowed } from "@ckeditor/ckeditor5-link/src/utils";
import { LINK_COMMAND_NAME, LINK_HREF_MODEL, LINK_TARGET_MODEL } from "./Constants";
import Writer from "@ckeditor/ckeditor5-engine/src/model/writer";
import Range from "@ckeditor/ckeditor5-engine/src/model/range";
import findAttributeRange from "@ckeditor/ckeditor5-typing/src/utils/findattributerange";
import Position from "@ckeditor/ckeditor5-engine/src/model/position";
import EventInfo from "@ckeditor/ckeditor5-utils/src/eventinfo";
import DocumentSelection from "@ckeditor/ckeditor5-engine/src/model/documentselection";
import Model from "@ckeditor/ckeditor5-engine/src/model/model";

/**
 * Extension to `LinkCommand` which takes care of setting the `linkTarget`
 * attribute according to settings in dialog.
 *
 * **Note:** This command should not be executed without the `LinkCommand`
 * being executed, as it will generate anchors with `target` but without
 * `href` attribute.
 */
export default class LinkTargetCommand extends Command {
  /**
   * The changes to apply on post-fix. We are using post-fix here to prevent
   * multiple entries in undo-history.
   * @private
   */
  private readonly _next: {
    enabled: boolean;
    target: string | "" | null;
    ranges: Range[];
  } = {
    enabled: false,
    target: null,
    ranges: [],
  };
  private readonly _changeAttributeCallback = (
    { path }: EventInfo,
    { attributeKeys }: { attributeKeys: string[] }
  ): void => {
    this._changedAttribute(this.editor.model, path, attributeKeys);
  };

  constructor(editor: Editor) {
    super(editor);

    const model = editor.model;
    const document = model.document;
    const selection = document.selection;

    document.registerPostFixer((writer) => this._updateTargetOnLinkHref(writer));
    selection.on("change:attribute", this._changeAttributeCallback);
  }

  private _changedAttribute(model: Model, path: unknown[], attributeKeys: string[]) {
    const pathLength = path.length;

    if (pathLength === 0) {
      return;
    }

    const last = path[pathLength - 1];

    if (last instanceof DocumentSelection) {
      if (attributeKeys.includes(LINK_HREF_MODEL) && !last.hasAttribute(LINK_HREF_MODEL)) {
        model.change((writer) => writer.removeSelectionAttribute(LINK_TARGET_MODEL));
      }
    }
  }

  private _resetNext(): void {
    this._next.enabled = false;
    this._next.target = null;
    this._next.ranges = [];
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

    linkCommand?.once("execute", () => {
      this._resetNext();
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
    this._next.enabled = true;
    this._next.target = target;
    this._next.ranges = rangesToUpdate;
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
      this._next.enabled = true;
      this._next.target = target;
      this._next.ranges = [linkRange];
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
    this._resetNext();

    const editor = this.editor;
    const model = editor.model;
    const selection = model.document.selection;
    selection.off("change:attribute", this._changeAttributeCallback);
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

    if (!this._next.enabled) {
      // We are currently not active (not working on LinkCommand). Let's just return.
      return false;
    }

    const operationsBefore = writer.batch.operations.length;

    for (const range of this._next.ranges) {
      this._setOrRemoveAttribute(writer, this._next.target, range);
    }

    const operationsAfter = writer.batch.operations.length;

    this._resetNext();

    return operationsBefore !== operationsAfter;
  }
}
