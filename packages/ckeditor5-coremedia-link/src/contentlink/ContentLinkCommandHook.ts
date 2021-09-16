import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import TextProxy from "@ckeditor/ckeditor5-engine/src/model/textproxy";
import Range from "@ckeditor/ckeditor5-engine/src/model/range";
import Writer from "@ckeditor/ckeditor5-engine/src/model/writer";
import { ModelUri, requireContentCkeModelUri, UriPath } from "@coremedia/ckeditor5-coremedia-studio-integration/content/UriPath";
import Logger from "@coremedia/ckeditor5-logging/logging/Logger";
import LoggerProvider from "@coremedia/ckeditor5-logging/logging/LoggerProvider";
import { DiffItem, DiffItemInsert } from "@ckeditor/ckeditor5-engine/src/model/differ";
import LinkEditing from "@ckeditor/ckeditor5-link/src/linkediting";
import { LINK_COMMAND_NAME } from "../link/Constants";
import { Item } from "@ckeditor/ckeditor5-engine/src/model/item";
import { ROOT_NAME } from "./Constants";

/**
 * Alias for easier readable code.
 */
type ContentName = string;

/**
 * Represents a registered replacement.
 *
 * Note, that the current implementation only supports one replacement at
 * a time.
 */
interface Replacement {
  /**
   * The URI as stored in the model, i.e. `content:123`.
   */
  modelUri: ModelUri;
  /**
   * The name to replace with.
   */
  name: ContentName;
}

/**
 * Helper object for tacking care of tracking the replacement.
 */
class TrackingData {
  /**
   * The recorded replacement, if any.
   * @private
   */
  #replacement: Replacement | undefined;

  /**
   * Write-only for replacement. It can only be read via `clear()` with
   * corresponding side-effect.
   * @param replacement
   */
  set replacement(replacement: Replacement) {
    this.#replacement = replacement;
  }

  /**
   * Signals, if a given diff item matches a previously recorded replacement.
   * @param diffItem diff item to compare
   */
  matches(diffItem: DiffItemInsert): boolean {
    // The length should match, we are not interested in it otherwise,
    // as obviously not the URI has been written to the text.
    return !!this.#replacement && diffItem.length === this.#replacement.modelUri.length;
  }

  /**
   * Signals, if a replacement has been recorded or not.
   */
  empty(): boolean {
    return !this.#replacement;
  }

  /**
   * Removes a possibly recorded replacement and returns it.
   */
  clear(): Replacement | undefined {
    const repl = this.#replacement;
    this.#replacement = undefined;
    return repl;
  }
}

/**
 * Gets shallow items from a given range.
 * @param range range to get included items for
 */
const getItems = (range: Range): Item[] => {
  return [...range.getItems({ shallow: true })];
};

/**
 * LinkCommand has a special handling when inserting links with a collapsed
 * (not expanded) selection (aka: no selection). We need to take care of this
 * behavior, which is, that LinkCommand inserts the `linkHref` attribute as
 * text within the editor and afterwards places the cursor after the link.
 *
 * For content-links this is no valid approach. We don't want `content:123`
 * to be written into the CKEditor text field. We want the content's name
 * to be written (and, perhaps, if not available because of concurrent changes,
 * fallback to the `content:123` form.
 *
 * **Approach:** While several approaches exist, the given approach ensures
 * that only one Undo-step is created when (instead of one for the raw
 * content-ID and the content-name afterwards) and that it does not require
 * deep integration into the private API of CKEditor's link feature.
 *
 * Thus, this hook is provided as post-fixer registered at the document.
 * To replace content names, it requires to be informed by the `FormView`
 * of a content name to replace. This is, because content names can only
 * be retrieved asynchronously, while a post-fixer needs to evaluate
 * synchronously.
 *
 * The suggest approach is, that the _Save_ button is disabled until the
 * `FormView` has a valid name to hand over to this plugin, which will then
 * use this name for replacement.
 *
 * **Usage Example:**
 *
 * ```
 * const plugin = <ContentLinkCommandHook | undefined>editor.plugins.get(ContentLinkCommandHook.pluginName);
 * plugin?.registerContentName("content/123", "myName");
 * ```
 *
 * If `registerContentName` is called multiple times, only the last registered
 * replacement will be considered.
 *
 * **Important:** The name must be registered, before `LinkCommand` is executed.
 *
 * **No need to check if replacement required on registration:**
 * It is this plugin which decides, if a replacement is required or not. More
 * specifically, it will only respond to content insertion events (via
 * document.differ) and not to attribute changes. I.e. with the current
 * implementation of `LinkCommand` (as of CKEditor 29.x) it will be triggered
 * if the `LinkCommands` calls `insertContent` for a collapsed selection outside
 * of an existing link – which again triggers the `linkHref` attribute to be
 * written to the text, which is the scenario, we want to prevent for
 * content-links.
 */
class ContentLinkCommandHook extends Plugin {
  static readonly pluginName: string = "ContentLinkCommandHook";
  static readonly #logger: Logger = LoggerProvider.getLogger(ContentLinkCommandHook.pluginName);

  readonly #trackingData: TrackingData = new TrackingData();

  /**
   * Callback to clear tracking data once link command finished executing.
   * Thus, the data are strongly bound to the link command only and
   * may not be used in other contexts.
   *
   * @return previously stored value, if any
   */
  readonly #clearTrackingData = (): Replacement | undefined => {
    return this.#trackingData.clear();
  };

  static get requires(): Array<new (editor: Editor) => Plugin> {
    // The LinkEditing registers the command, which we want to hook into.
    return [LinkEditing];
  }

  /**
   * Registers the post-fixer.
   */
  init(): null {
    const logger = ContentLinkCommandHook.#logger;
    const startTimestamp = performance.now();
    const pluginName = ContentLinkCommandHook.pluginName;

    logger.debug(`Initializing ${pluginName}...`);

    const editor = this.editor;
    const model = editor.model;
    const document = model.document;

    const linkCommand = editor.commands.get(LINK_COMMAND_NAME);

    if (!linkCommand) {
      logger.warn(
        `Required command named '${LINK_COMMAND_NAME}' is not available. Content-Links names won't be replaced in text.`
      );
      return null;
    }

    /*
     * When LinkCommand finished executing, we don't want to apply any more
     * changes. Thus, we may safely clear the tracked data. Note, that this
     * requires that the replacement is registered **before** LinkCommand is
     * executed.
     */
    linkCommand.on("execute", this.#clearTrackingData);

    /*
     * Callbacks: We need to create an extra "redirection" as otherwise, we
     * won't have access to `this` anymore.
     */
    document.registerPostFixer((writer) => this.#postFix(writer));

    logger.debug(`Initialized ${pluginName} within ${performance.now() - startTimestamp} ms.`);

    return null;
  }

  /**
   * Clears resources, i.e. the name cache.
   */
  destroy(): null {
    const editor = this.editor;
    const linkCommand = editor.commands.get(LINK_COMMAND_NAME);

    linkCommand?.off("execute", this.#clearTrackingData);

    this.#trackingData.clear();

    return null;
  }

  /**
   * Hook for FormView to register a content-name which is about to be replaced
   * as soon as CKEditor's Link Features tries to insert the "raw link" into
   * CKEditor text.
   *
   * For any unregistered URI path, the name generated by CKEditor's Link
   * Feature won't be vetoed.
   *
   * Subsequent calls to this method will override a previous replacement,
   * i.e. only one replacement is remembered at a time.
   *
   * The registration must be done prior to the execution of `LinkCommand`.
   *
   * The replacement cache is cleared as soon as `LinkCommand` finished
   * execution.
   *
   * @param uriOrPath URI path of the content (`content/123`) or content URI
   * as stored in the model (`content:123`).
   * @param name resolved name
   */
  registerContentName(uriOrPath: UriPath | ModelUri, name: string): void {
    this.#trackingData.replacement = {
      modelUri: requireContentCkeModelUri(uriOrPath),
      name: name,
    };
  }

  /**
   * Identifies, if the given DiffItem is of type `DiffItemInsert` and
   * if it represents a text node insertion.
   *
   * @param value DiffItem to validate
   * @private
   */
  static #isTextNodeInsertion(value: DiffItem): boolean {
    if (value.type === "insert") {
      const insertion = <DiffItemInsert>value;
      // Unfortunately, insertion.position.textNode does not (yet) represent
      // the currently added text node, but the text node the inserted one
      // may have been merged with.
      return insertion.name === "$text";
    }
    return false;
  }

  /**
   * Just cast to `DiffItemInsert`, expecting that it has been validated before,
   * that the cast is valid.
   * @param value value to cast
   * @private
   */
  static #asDiffItemInsert(value: DiffItem): DiffItemInsert {
    return <DiffItemInsert>value;
  }

  /**
   * Replaces the given raw content-link with the name of the content, if
   * it has been previously registered to the name cache.
   *
   * @param writer used to apply the change
   * @param textProxy the representation for the text which got inserted
   * @param range range for the text
   * @return `true` iff. the text node has been replaced; `false` otherwise
   * @private
   */
  #replaceRawLink(writer: Writer, textProxy: TextProxy, range: Range): boolean {
    const logger = ContentLinkCommandHook.#logger;

    const replacement: Replacement | undefined = this.#trackingData.clear();

    if (!replacement) {
      logger.debug(`Skipped replacement as no replacement was registered.`);
      return false;
    }

    const { modelUri: href } = replacement;

    /*
     * Empty Name: This signals, that we want to link to the root folder
     * While this is unexpected in editorial context, it is a valid call
     * and thus, must be handled.
     */
    const name: ContentName = replacement.name || ROOT_NAME;

    /*
     * name !== href: Corner case, when the name really matches the model
     * representation. There is nothing to do then.
     */
    if (name !== href) {
      /*
       * We need to remember the position of the original text. This is because
       * we need to remove the text prior to adding a new one, as otherwise
       * the text nodes will be merged by CKEditor, which again makes it impossible
       * to remove the original text.
       * Prevent to do that again.
       */
      const position = range.start;
      // We want to apply the very same attributes.
      const attrs = textProxy.getAttributes();

      // We first need to remove the text, as otherwise it will be merged with
      // the next text to add.
      writer.remove(textProxy);
      writer.insertText(name, attrs, position);

      return true;
    }

    return false;
  }

  /**
   * Post-Fix handler, which will quickly exit, when there is nothing known
   * to do. Otherwise, it will replace a raw content-Model-URI written by
   * `LinkCommand` for collapsed selections by the content name.
   *
   * @param writer writer to possibly apply changes
   * @private
   */
  #postFix(writer: Writer): boolean {
    if (this.#trackingData.empty()) {
      // We don't have all required data yet, thus, we don't know how to possibly
      // adjust raw content-links. Nothing to do.
      return false;
    }

    const isTextNodeInsertion = ContentLinkCommandHook.#isTextNodeInsertion;
    const asDiffItemInsert = ContentLinkCommandHook.#asDiffItemInsert;

    const model = writer.model;
    const document = model.document;
    const differ = document.differ;

    const changes = differ.getChanges();
    const textInsertions: DiffItemInsert[] = changes.filter(isTextNodeInsertion).map(asDiffItemInsert);
    // For the given scenario, we expect at most one matched diff item.
    const matchedDiffItem = textInsertions.find((diffItem) => this.#trackingData.matches(diffItem));

    if (!!matchedDiffItem) {
      return this.#postFixMatchedItem(writer, matchedDiffItem);
    }

    return false;
  }

  /**
   * Applies the change to map the raw content link model URI to the content's
   * name. Some consistency checks are made before, so that the change is only
   * applied, when we are very sure, to be doing _the right thing_.
   *
   * @param writer writer to apply changes
   * @param matchedDiffItem diff item which represents the link insertion
   * @private
   */
  #postFixMatchedItem(writer: Writer, matchedDiffItem: DiffItemInsert): boolean {
    const toRange = (diffItem: DiffItemInsert): Range => {
      const { position: start } = diffItem;
      const end = start.getShiftedBy(diffItem.length);
      return writer.createRange(start, end);
    };

    const range: Range = toRange(matchedDiffItem);
    const itemsInRange = getItems(range);

    if (itemsInRange.length !== 1) {
      /*
       * As we only want to deal with one atomic `insertContent` triggered
       * by `LinkCommand` we don't have to deal with any ranges that cross
       * several items. And obviously, there is nothing to do, if no items
       * are covered by the given range.
       */
      return false;
    }

    const onlyItem: Item = itemsInRange[0];

    if (!onlyItem.is("model:$textProxy")) {
      /*
       * We only deal with text proxies, which should be the result of the insert operation
       * from LinkCommand.
       */
      return false;
    }
    const textProxy = <TextProxy>(<unknown>onlyItem);
    return this.#replaceRawLink(writer, textProxy, range);
  }
}

export default ContentLinkCommandHook;
