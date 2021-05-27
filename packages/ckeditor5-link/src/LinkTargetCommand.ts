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
import { Logger, LoggerProvider } from "@coremedia/coremedia-utils/index";

/**
 * Signals to delete a target.
 */
type DeletedTarget = "" | null | undefined;
/**
 * Possible types a target could take, where falsy values signal to remove
 * the target. In contrast to `linkHref` we do not keep an empty string as
 * `linkTarget`.
 */
type Target = string | DeletedTarget;
/**
 * Possible values `linkHref` attribute could take. In contrast to
 * `linkTarget` only `null` represents a deleted attribute, while an
 * empty string will be stored as empty `linkHref` in model.
 */
type Href = string | "" | null;

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
   * The changes to apply on post-fix. We are using post-fix here to prevent
   * multiple entries in undo-history.
   * @private
   */
  private readonly _next: {
    /**
     * If post-fix is to be applied. Will synchronize with `LinkCommand`.
     */
    enabled: boolean;
    /**
     * That target to set. Falsy values will be handled as _remove target_.
     */
    target: Target;
    /**
     * Ranges to apply target to.
     */
    ranges: Range[];
  } = {
    enabled: false,
    target: null,
    ranges: [],
  };
  /**
   * Callback to listen to `removeSelectionAttribute` triggered by
   * `LinkCommand`. It will ensure, that `linkTarget` is removed from
   * selection attributes as well, when `linkHref` is removed.
   * @param path path from `EventInfo`
   * @param attributeKeys attribute keys for which selection attributes just
   * changed. As this event is triggered after the change got applied, we can
   * retrieve the actual new attribute values from the selection.
   */
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

  /**
   * Used as callback to listen to `removeSelectionAttribute` triggered by
   * `LinkCommand`. It will ensure, that `linkTarget` is removed from
   * selection attributes as well, when `linkHref` is removed.
   *
   * @param model model to apply additional modifications
   * @param path path from `EventInfo`
   * @param attributeKeys attribute keys for which selection attributes just
   * changed. As this event is triggered after the change got applied, we can
   * retrieve the actual new attribute values from the selection.
   * @private
   */
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

  /**
   * Reset next tracking to default value, which especially disabled the
   * post-fixer temporarily.
   * @private
   */
  private _resetNext(): void {
    this._next.enabled = false;
    this._next.target = null;
    this._next.ranges = [];
  }

  /**
   * Refresh `linkTarget` from currently selected element.
   */
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
   * Execute LinkTargetCommand. In contrast to normal commands, this does not
   * apply a change directly. Instead, it listens to changes as applied by
   * `LinkCommand` to apply changes for `linkTarget` as well.
   *
   * On command execution, the value and ranges will be stored which will
   * later be used to set (or remove) the `linkTarget` attribute.
   *
   * @param target target to apply
   * @param href href for reference from dialog; used to distinguish some
   * behaviors triggered by `LinkCommand`.
   */
  execute(target: Target, href: Href): void {
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
      // LinkCommand may not have made any changes (if href had not been
      // changed). Ensure that we check for this after command execution.
      if (this._next.enabled) {
        model.change((writer) => this._updateTargetOnLinkHref(writer));
      }
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
  private _handleExpandedSelection(writer: Writer, target: Target): void {
    const editor = this.editor;
    const model = editor.model;
    const selection = model.document.selection;
    const ranges = [...model.schema.getValidRanges(selection.getRanges(), LINK_TARGET_MODEL)];
    const allowedRanges = [];
    for (const element of selection.getSelectedBlocks()) {
      if (model.schema.checkAttribute(element, LINK_TARGET_MODEL)) {
        allowedRanges.push(writer.createRangeOn(element));
      }
    }

    const rangesToUpdate = [...allowedRanges];

    for (const range of ranges) {
      if (LinkTargetCommand._isRangeToUpdate(range, allowedRanges)) {
        rangesToUpdate.push(range);
      }
    }
    this._next.enabled = rangesToUpdate.length > 0;
    this._next.target = target;
    this._next.ranges = rangesToUpdate;

    this.logger.debug("Recorded linkTarget update for next document post-fix for expanded selection.", {
      ...this._next,
    });
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
    target: Target,
    href: Href,
    linkCommand: Command | undefined
  ): void {
    const editor = this.editor;
    const model = editor.model;
    const selection = model.document.selection;
    const position: Position | null = selection.getFirstPosition();

    const hasLinkTarget = selection.hasAttribute(LINK_TARGET_MODEL);
    const hasLinkHref = selection.hasAttribute("linkHref");

    if (hasLinkTarget || hasLinkHref) {
      if (!position) {
        this.logger.warn("Unable to apply `linkTarget` attribute as selection does not provide a first position.");
        return;
      }

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

      this.logger.debug("Recorded linkTarget update for next document post-fix for collapsed selection.", {
        ...this._next,
      });
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
  private static _setOrRemoveAttribute(writer: Writer, target: Target, range: Range): void {
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
    if (!this._next.enabled) {
      // We are currently not active (not working on LinkCommand). Let's just return.
      return false;
    }

    this.logger.debug("Post-fix triggered to update linkTarget.", { ...this._next });

    const operationsBefore = writer.batch.operations.length;

    for (const range of this._next.ranges) {
      LinkTargetCommand._setOrRemoveAttribute(writer, this._next.target, range);
    }

    const operationsAfter = writer.batch.operations.length;

    // We applied our changes, nothing more to add. Prevents infinite recursions
    // implicitly.
    this._resetNext();

    return operationsBefore !== operationsAfter;
  }
}
