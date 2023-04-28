import { Command } from "@ckeditor/ckeditor5-core";
import { Element, Range, Schema, DocumentSelection, Position, Model, Writer } from "@ckeditor/ckeditor5-engine";
import { LINK_TARGET_MODEL } from "../Constants";
import { LINK_HREF_MODEL } from "@coremedia/ckeditor5-link-common/src/Constants";
import { first } from "@ckeditor/ckeditor5-utils";
import { findAttributeRange } from "@ckeditor/ckeditor5-typing";

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
 * Command to be bound in `LinkActionsView` to set a certain target behavior.
 */
class LinkTargetCommand extends Command {
  /**
   * Update value and enabled state.
   */
  override refresh(): void {
    const model = this.editor.model;
    const document = model.document;
    const schema = model.schema;
    const selection: DocumentSelection = document.selection;
    const selectedElement = selection.getSelectedElement() ?? first(selection.getSelectedBlocks());
    const attributesAllowedFor = LinkTargetCommand.attributesAllowedFor;
    const checkAttributes = LinkTargetCommand.#checkAttributes;
    const checkAttributeInSelection = LinkTargetCommand.#checkAttributeInSelection;

    /*
     * The following code matches the evaluation in `LinkCommand` with the following
     * comment:
     *
     * > A check for any integration that allows linking elements (e.g. `LinkImage`).
     * > Currently the selection reads attributes from text nodes only. See #7429 and #7465.
     *
     * Note, that there is a subtle difference between `schema.checkAttribute(<string>, ...)`
     * and `schema.checkAttribute(<element>, ...)`. For details see `SchemaContextDefinition`.
     */
    if (attributesAllowedFor(selectedElement, schema, LINK_HREF_MODEL, LINK_TARGET_MODEL)) {
      this.value = selectedElement?.getAttribute(LINK_TARGET_MODEL);
      this.isEnabled =
        !!selectedElement && checkAttributes(selectedElement, schema, LINK_HREF_MODEL, LINK_TARGET_MODEL);
    } else {
      this.value = selection.getAttribute(LINK_TARGET_MODEL);
      this.isEnabled = checkAttributeInSelection(selection, schema, LINK_HREF_MODEL, LINK_TARGET_MODEL);
    }
  }

  /**
   * Validates if all given attributes are hypothetically supported by the
   * given element. The result is always `false` if the element does not exist.
   *
   * @param element - element to hypothetically validate attributes for
   * @param schema - schema to use for validation
   * @param attribute - first attribute to check
   * @param otherAttributes - other attributes to check
   */
  protected static attributesAllowedFor(
    element: Element | null | undefined,
    schema: Schema,
    attribute: string,
    ...otherAttributes: string[]
  ): boolean {
    if (!element) {
      return false;
    }
    const attributes = [attribute, ...otherAttributes];
    const elementName = element.name;
    return attributes.every((attr) => schema.checkAttribute(elementName, attr));
  }

  /**
   * Checks that all given attributes are allowed for given element.
   *
   * @param element - element, which must allow all attributes
   * @param schema - schema to use for validation
   * @param attribute - first attribute to check
   * @param otherAttributes - other attributes to check
   */
  static #checkAttributes(element: Element, schema: Schema, attribute: string, ...otherAttributes: string[]): boolean {
    const attributes = [attribute, ...otherAttributes];
    return attributes.every((attr) => schema.checkAttribute(element, attr));
  }

  /**
   * Checks that all given attributes are allowed for given selection.
   *
   * @param selection - selection, which must allow all attributes
   * @param schema - schema to use for validation
   * @param attribute - first attribute to check
   * @param otherAttributes - other attributes to check
   */
  static #checkAttributeInSelection(
    selection: DocumentSelection,
    schema: Schema,
    attribute: string,
    ...otherAttributes: string[]
  ): boolean {
    const attributes = [attribute, ...otherAttributes];
    return attributes.every((attr) => schema.checkAttributeInSelection(selection, attr));
  }

  /**
   * Executes the command to apply the given target. If the target is falsy
   * (thus, empty string, null or undefined), the `linkTarget` attribute will
   * be removed instead.
   *
   * @param target - target to set; empty string/null/undefined to trigger removal of `linkTarget` attribute
   */
  override execute(target: Target): void {
    const editor = this.editor;
    const model = editor.model;
    const findCurrentLinkHrefRanges = LinkTargetCommand.#findCurrentLinkHrefRanges;
    const setOrRemoveTarget = LinkTargetCommand.#setOrRemoveTarget;

    model.change((writer) => {
      // Get ranges to unlink.
      const rangesToUpdate = findCurrentLinkHrefRanges(model);

      // Remove `linkHref` attribute from specified ranges.
      for (const range of rangesToUpdate) {
        setOrRemoveTarget(writer, target, range);
      }
    });
  }

  /**
   * Depending on the target if it is empty or not, the attribute is either
   * removed from the given range or set.
   */
  static #setOrRemoveTarget(writer: Writer, target: Target, range: Range): void {
    // If we empty the target, we just want to remove it.
    if (!target) {
      // May remove `linkTarget` attribute, where there isn't any. But
      // this does no harm. The following command will just do nothing.
      writer.removeAttribute(LINK_TARGET_MODEL, range);
    } else {
      // May set the same value as already set. Just as for
      // removal: Won't do any action, if the target attribute did
      // not change.
      writer.setAttribute(LINK_TARGET_MODEL, target, range);
    }
  }

  /**
   * Similar to `UnlinkCommand` we want to process all ranges, which provide the
   * current `linkHref` attribute. This method returns those ranges, either
   * for a collapsed or an expanded selection.
   *
   * @param model - model to retrieve ranges for
   */
  static #findCurrentLinkHrefRanges(model: Model): Range[] {
    const selection = model.document.selection;

    if (selection.isCollapsed) {
      const findAttributeRanges = LinkTargetCommand.#findAttributeRanges;
      const linkHrefModel = selection?.getAttribute(LINK_HREF_MODEL);

      if (typeof linkHrefModel !== "string") {
        throw new Error(
          `Unexpected type for attribute ${LINK_HREF_MODEL}. Expected "string" but value is: ${linkHrefModel}`
        );
      }

      return findAttributeRanges(selection.getFirstPosition(), LINK_HREF_MODEL, linkHrefModel, model);
    }

    return [...model.schema.getValidRanges([...selection.getRanges()], LINK_HREF_MODEL)];
  }

  /**
   * Null-Safe access for `findAttributeRange` which returns an empty
   * array of ranges, if position is _falsy_.
   *
   * @param position - position to check
   * @param attributeName - attribute name
   * @param value - attribute value
   * @param model - model to get range for
   */
  static #findAttributeRanges(
    position: Position | null | undefined,
    attributeName: string,
    value: string,
    model: Model
  ): Range[] {
    if (!position) {
      return [];
    }
    return [findAttributeRange(position, attributeName, value, model)];
  }
}

export default LinkTargetCommand;
export { Target, DeletedTarget };
