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
import Text from "@ckeditor/ckeditor5-engine/src/model/text";

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
 * Next target value to set in post-fixer.
 */
type NextTarget = {
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
};
type InsertContentCallback = (eventInfo: EventInfo, params: Array<unknown>) => void;

type ChangeAttributeCallback = ({ path }: EventInfo, { attributeKeys }: { attributeKeys: string[] }) => void;

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
  private readonly _next: NextTarget = {
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
  private readonly _changeAttributeCallback: ChangeAttributeCallback = (
    { path }: EventInfo,
    { attributeKeys }: { attributeKeys: string[] }
  ): void => {
    this._changedAttribute(this.editor.model, path, attributeKeys);
  };

  private _insertContentCallback: undefined | InsertContentCallback;

  /**
   * Constructor.
   *
   * @param editor the editor this command is bound to
   */
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
   * Reset next tracking to default value, which especially disables the
   * post-fixer temporarily. Also removes any temporarily existing callbacks.
   *
   * @private
   */
  private _reset(): void {
    this._next.enabled = false;
    this._next.target = null;
    this._next.ranges = [];

    if (this._insertContentCallback) {
      const editor = this.editor;
      const model = editor.model;
      model.off("insertContent", this._insertContentCallback);
    }
  }

  /**
   * Set the next target to apply.
   *
   * @param target target to set
   * @param ranges ranges to set target for
   * @private
   */
  private _setNext(target: Target, ...ranges: Range[]): void {
    this._next.target = target;
    this._next.ranges = ranges;
    this._next.enabled = ranges.length > 0;

    this.logger.debug("Recorded linkTarget update for next document post-fix for expanded selection.", {
      ...this._next,
    });
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

    if (selection.isCollapsed) {
      this._handleCollapsedSelection(target, href);
    } else {
      this._handleExpandedSelection(target);
    }

    linkCommand?.once("execute", () => {
      // LinkCommand may not have made any changes (if href had not been
      // changed). Ensure that we check for this after command execution.
      model.change((writer) => this._updateTargetOnLinkHref(writer));
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
  private _handleExpandedSelection(target: Target): void {
    const editor = this.editor;
    const model = editor.model;
    const selection = model.document.selection;
    const ranges = [...model.schema.getValidRanges(selection.getRanges(), LINK_TARGET_MODEL)];
    const allowedRanges: Range[] = [];

    model.change((writer) => {
      for (const element of selection.getSelectedBlocks()) {
        if (model.schema.checkAttribute(element, LINK_TARGET_MODEL)) {
          allowedRanges.push(writer.createRangeOn(element));
        }
      }
    });

    const rangesToUpdate: Range[] = [...allowedRanges];

    for (const range of ranges) {
      if (LinkTargetCommand._isRangeToUpdate(range, allowedRanges)) {
        rangesToUpdate.push(range);
      }
    }
    this._setNext(target, ...rangesToUpdate);
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
  private _handleCollapsedSelection(target: Target, href: Href): void {
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
      this._setNext(target, linkRange);
    } else if (!!target && !!href) {
      this._registerInsertContentCallback(target);
    }
  }

  /**
   * Registers a callback for `insertContent` expecting, that `LinkCommand`
   * will insert some text which consists of the `linkHref` attribute value
   * along with an attribute `linkHref` (and decorators).
   *
   * If this is triggered, the callback will ensure, that the created text
   * is handled on post-fixing to apply the given target attribute.
   *
   * @param target target attribute to apply
   * @private
   */
  private _registerInsertContentCallback(target: Target): void {
    this._insertContentCallback = this._createInsertContentCallback(target);
    this.editor.model.once("insertContent", this._insertContentCallback);
  }

  private _createInsertContentCallback(target: Target): InsertContentCallback {
    return (eventInfo: EventInfo, params: Array<unknown>) => {
      const range = <Range>eventInfo.return;
      if (range && params.length > 0) {
        const firstParam = params[0];
        if (firstParam instanceof Text && !!firstParam.getAttribute(LINK_HREF_MODEL)) {
          this._setNext(target, range);
        }
      }
    };
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
    this._reset();

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
    this._reset();

    return operationsBefore !== operationsAfter;
  }
}
