import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import Logger from "@coremedia/coremedia-utils/logging/Logger";
import LoggerProvider from "@coremedia/coremedia-utils/logging/LoggerProvider";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import LinkUI from "@ckeditor/ckeditor5-link/src/linkui";
import { DiffItem, DiffItemAttribute } from "@ckeditor/ckeditor5-engine/src/model/differ";
import Writer from "@ckeditor/ckeditor5-engine/src/model/writer";
import Range from "@ckeditor/ckeditor5-engine/src/model/range";
import { LINK_HREF_MODEL } from "./Constants";

/**
 * Provides configuration options for attributes which must not exist without
 * corresponding `linkHref` attribute.
 */
interface LinkCleanupRegistry {
  /**
   * Registers an attribute to be removed from a given range, when a
   * `linkHref` attribute got removed.
   *
   * @param modelAttributeName name of the model attribute to possibly remove
   */
  registerDependentAttribute(modelAttributeName: string): void;

  /**
   * Unregisters an attribute, which in result, will not be removed anymore
   * when a `linkHref` attribute got removed.
   *
   * @param modelAttributeName name of the model attribute not to remove anymore
   * @returns `true` if attribute got removed; `false` if that attribute was not registered anymore
   */
  unregisterDependentAttribute(modelAttributeName: string): boolean;
}

/**
 * A plugin which will listen to removed links (this removed `linkHref`
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
  static readonly #logger: Logger = LoggerProvider.getLogger(LinkCleanup.pluginName);

  readonly #watchedAttributes: Set<string> = new Set<string>();

  static get requires(): Array<new (editor: Editor) => Plugin> {
    // LinkUI: Registers the commands which are expected to set/unset `linkHref`
    return [LinkUI];
  }

  init(): null {
    const logger = LinkCleanup.#logger;
    const startTimestamp = performance.now();

    logger.debug(`Initializing ${LinkCleanup.pluginName}...`);

    const editor = this.editor;
    const model = editor.model;
    const document = model.document;

    document.registerPostFixer(this.#fixOrphanedAttributes);

    logger.debug(`Initialized ${LinkCleanup.pluginName} within ${performance.now() - startTimestamp} ms.`);

    return null;
  }

  destroy(): null {
    // Implicitly disabled post-fixer, as it cannot be disabled explicitly.
    this.#watchedAttributes.clear();
    return null;
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
   * @param writer writer to apply changes
   * @returns `true` if changes got applied, and post-fix chain shall be re-triggered; `false` on no changes
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
   * @param writer writer to get relevant diff-items from
   */
  static readonly #getLinkHrefRemovalRanges = (writer: Writer): Iterable<Range> => {
    const model = writer.model;
    return model.document.differ
      .getChanges()
      .filter(isRemoveLinkHrefAttribute)
      .map((c) => (<DiffItemAttribute>c).range);
  };

  static readonly #fixOrphanedAttribute = (
    writer: Writer,
    relevantRanges: Iterable<Range>,
    modelAttributeName: string): void => {

    const model = writer.model;
    const validRanges = Array.from(model.schema.getValidRanges(relevantRanges, modelAttributeName));
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
 * @param editor current editor instance
 */
const getLinkCleanup = (editor: Editor): LinkCleanupRegistry | undefined => {
  return editor.plugins.get(LinkCleanup);
};

/**
 * Checks, if this diff item represents a change regarding removal of
 * linkHref.
 *
 * @param diffItem item to check
 */
const isRemoveLinkHrefAttribute = (diffItem: DiffItem): boolean => {
  if (diffItem.type !== "attribute") {
    return false;
  }
  const diffItemAttribute: DiffItemAttribute = <DiffItemAttribute>diffItem;
  // We must not simply check for 'falsy' here, as an empty string does not
  // represent a deletion of the attribute, but signals (you guessed it), that
  // the attribute got set to an empty string.
  const isDeleteAttribute =
    diffItemAttribute.attributeNewValue === null || diffItemAttribute.attributeNewValue === undefined;
  return isDeleteAttribute && diffItemAttribute.attributeKey === LINK_HREF_MODEL;
};

export { getLinkCleanup, LinkCleanupRegistry };
export default LinkCleanup;
