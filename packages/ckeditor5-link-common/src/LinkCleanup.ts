/* eslint no-null/no-null: off */

import LoggerProvider from "@coremedia/ckeditor5-logging/src/logging/LoggerProvider";
import { LINK_HREF_MODEL } from "./Constants";
import { reportInitEnd, reportInitStart } from "@coremedia/ckeditor5-core-common/src/Plugins";
import { Plugin, Editor, DiffItem, DiffItemAttribute, Writer, Range, LinkEditing } from "ckeditor5";

/**
 * Provides configuration options for attributes, which must not exist without
 * corresponding `linkHref` attribute.
 */
interface LinkCleanupRegistry {
  /**
   * Registers an attribute to be removed from a given range, when a
   * `linkHref` attribute got removed.
   *
   * @param modelAttributeName - name of the model attribute to possibly remove
   */
  registerDependentAttribute(modelAttributeName: string): void;

  /**
   * Unregisters an attribute, which in return, will not be removed anymore
   * when a `linkHref` attribute got removed.
   *
   * @param modelAttributeName - name of the model attribute not to remove anymore
   * @returns `true` if attribute got removed; `false` if that attribute was not registered anymore
   */
  unregisterDependentAttribute(modelAttributeName: string): boolean;
}

/**
 * A plugin, which will listen to removed links, thus, removed `linkHref`
 * attributes and remove any possible orphaned link attributes. All link
 * attributes to remove, must be registered at this plugin.
 *
 * An alternative to this plugin may be listening to `Unlink` command, which
 * again raises the challenge to calculate the affected ranges to modify.
 *
 * The plugin is based on a post-fixer registered at the document
 */
class LinkCleanup extends Plugin implements LinkCleanupRegistry {
  static readonly pluginName: string = "LinkCleanup";
  static readonly #logger = LoggerProvider.getLogger(LinkCleanup.pluginName);
  readonly #watchedAttributes: Set<string> = new Set<string>();
  static readonly requires = [];
  init(): void {
    const initInformation = reportInitStart(this);
    const { editor } = this;
    const { model } = editor;
    const { document } = model;
    if (!editor.plugins.has(LinkEditing)) {
      // We are implicitly bound to the UnlinkCommand defined by the
      // LinkEditing plugin.
      const logger = LinkCleanup.#logger;
      logger.info("LinkEditing unavailable. Registered link attributes may not be handled as possibly expected.");
    }
    document.registerPostFixer(this.#fixOrphanedAttributes);
    reportInitEnd(initInformation);
  }
  override destroy(): void {
    // Implicitly disabled post-fixer, as it cannot be disabled explicitly.
    this.#watchedAttributes.clear();
  }
  registerDependentAttribute(modelAttributeName: string): void {
    this.#watchedAttributes.add(modelAttributeName);
  }
  unregisterDependentAttribute(modelAttributeName: string): boolean {
    return this.#watchedAttributes.delete(modelAttributeName);
  }

  /**
   * Post-Fix Listener to remove possibly orphaned attributes, which are
   * bound to `linkHref`.
   *
   * @param writer - writer to apply changes
   * @returns `true` if changes got applied, and the post-fix chain shall be
   * re-triggered; `false` on no changes
   */
  readonly #fixOrphanedAttributes = (writer: Writer): boolean => {
    const todoAttributes = [...this.#watchedAttributes];
    const getLinkHrefRemovalRanges = LinkCleanup.#getLinkHrefRemovalRanges;
    const fixOrphanedAttribute = LinkCleanup.#fixOrphanedAttribute;
    if (todoAttributes.length === 0) {
      return false;
    }
    const ranges = getLinkHrefRemovalRanges(writer);
    // Workaround for missing feature ckeditor/ckeditor5#9627
    const operationsBefore = writer.batch.operations.length;
    todoAttributes.forEach((name): void => fixOrphanedAttribute(writer, ranges, name));
    const operationsAfter = writer.batch.operations.length;

    /*
     * If there were no (more) orphaned attributes to remove, `removeAttribute`
     * would not have added any more operations.
     *
     * We take this to signal, if a re-run of other post-fixers (including this
     * one) is required (= true) or not (= false).
     */
    return operationsBefore !== operationsAfter;
  };

  /**
   * Get ranges, where `linkHref` attribute got removed.
   *
   * @param writer - writer to get relevant diff-items from
   */
  static readonly #getLinkHrefRemovalRanges = (writer: Writer): Iterable<Range> => {
    const { differ } = writer.model.document;
    const changes = differ.getChanges();
    return changes.filter(isRemoveLinkHrefAttribute).map((c) => (c as DiffItemAttribute).range);
  };
  static readonly #fixOrphanedAttribute = (
    writer: Writer,
    relevantRanges: Iterable<Range>,
    modelAttributeName: string,
  ): void => {
    const model = writer.model;
    const validRanges = Array.from(model.schema.getValidRanges([...relevantRanges], modelAttributeName));
    /*
     * We may not have applied all required attribute removals for given attribute
     * yet. Instead of checking for the uncovered ranges, yet, we just add
     * corresponding removeAttribute calls again.
     */
    validRanges.forEach((range) => writer.removeAttribute(modelAttributeName, range));
  };
}

/**
 * Retrieve an instance of LinkCleanup-Plugin for registering/unregistering
 * model attribute names.
 *
 * @example
 * ```typescript
 * getLinkCleanup(editor)?.registerDependentAttribute("linkTarget");
 * ```
 * @param editor - current editor instance
 */
const getLinkCleanup = (editor: Editor): LinkCleanupRegistry | undefined => editor.plugins.get(LinkCleanup);

/**
 * Checks, if this diff item represents a change regarding removal of
 * linkHref.
 *
 * @param diffItem - item to check
 */
const isRemoveLinkHrefAttribute = (diffItem: DiffItem): boolean => {
  if (diffItem.type !== "attribute") {
    return false;
  }
  const { attributeKey, attributeNewValue } = diffItem;

  // We must not simply check for 'falsy' here, as an empty string does not
  // represent a deletion of the attribute, but signals (you guessed it) that
  // the attribute got set to an empty string.
  const isDeleteAttribute = attributeNewValue === null || attributeNewValue === undefined;
  return isDeleteAttribute && attributeKey === LINK_HREF_MODEL;
};
export { getLinkCleanup, LinkCleanupRegistry };
export default LinkCleanup;
