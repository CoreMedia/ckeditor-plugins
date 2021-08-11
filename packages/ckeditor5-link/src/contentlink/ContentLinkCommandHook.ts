import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import Text from "@ckeditor/ckeditor5-engine/src/model/text";
import Writer from "@ckeditor/ckeditor5-engine/src/model/writer";
import {
  CONTENT_CKE_MODEL_URI_REGEXP,
  ModelUri,
  requireContentCkeModelUri,
  UriPath,
} from "@coremedia/coremedia-studio-integration/content/UriPath";
import Logger from "@coremedia/coremedia-utils/logging/Logger";
import LoggerProvider from "@coremedia/coremedia-utils/logging/LoggerProvider";
import { DiffItem, DiffItemInsert } from "@ckeditor/ckeditor5-engine/src/model/differ";
import LinkEditing from "@ckeditor/ckeditor5-link/src/linkediting";
import { LINK_COMMAND_NAME, LINK_HREF_MODEL } from "../link/Constants";
import EventInfo from "@ckeditor/ckeditor5-utils/src/eventinfo";
import Position from "@ckeditor/ckeditor5-engine/src/model/position";

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

interface InsertedContentLink {
  text: Text;
  href: string;
}

interface TrackedData {
  replacement: Replacement;
  contentLink: InsertedContentLink;
}

class TrackingData {
  #replacement: Replacement | undefined;
  #contentLink: InsertedContentLink | undefined;

  set replacement(replacement: Replacement) {
    this.#replacement = replacement;
  }

  set contentLink(contentLink: InsertedContentLink) {
    this.#contentLink = contentLink;
  }

  matches(diffItem: DiffItemInsert): boolean {
    if (this.emptyOrIncomplete()) {
      return false;
    }
    console.warn("matches", {
      diffItem: { ...diffItem },
      text: { ...this.#contentLink?.text },
    });
    return true;
  }

  emptyOrIncomplete(): boolean {
    return !this.#replacement || !this.#contentLink;
  }

  clear(): TrackedData | undefined {
    const repl = this.#replacement;
    const link = this.#contentLink;

    this.#replacement = undefined;
    this.#contentLink = undefined;

    if (!repl || !link) {
      // Result is only relevant, if both are set.
      return undefined;
    }
    return {
      replacement: repl,
      contentLink: link,
    };
  }
}

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
  readonly #clearTrackingData = (): TrackedData | undefined => {
    return this.#trackingData.clear();
  };

  readonly #insertContentInterceptor = (eventInfo: EventInfo, args: unknown[]) => this.#interceptInsertContent(args);

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

    linkCommand.on("execute", this.#clearTrackingData);
    model.on("insertContent", this.#insertContentInterceptor);

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
    const model = editor.model;
    const linkCommand = editor.commands.get(LINK_COMMAND_NAME);

    linkCommand?.off("execute", this.#clearTrackingData);
    model.off("insertContent", this.#insertContentInterceptor);

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

  static #asDiffItemInsert(value: DiffItem): DiffItemInsert {
    return <DiffItemInsert>value;
  }

  /**
   * Transforms the given DiffItem to a text node. Expects, that it is
   * previously validated, that this transformation is applicable.
   *
   * @param value value to transform to text node
   * @private
   */
  static #toTextNode(value: DiffItem): Text {
    return <Text>(<DiffItemInsert>value).position.textNode;
  }

  /**
   * Validates, if the given text node represents a _raw content-link_.
   * Thus, it validates, if the text has a `linkHref` attribute set and
   * that the `linkHref` denotes a link to a content item.
   *
   * @param text text node to validate
   * @private
   */
  static #isRawContentLink(text: Text): boolean {
    // Parent Check: We won't deal with text nodes not attached to DOM (anymore).
    if (!!text.parent && text.hasAttribute(LINK_HREF_MODEL)) {
      const href = <string>text.getAttribute(LINK_HREF_MODEL);
      /*
       * We only want to take care of content-links, and if they were
       * inserted in "raw" form, i.e. that CKEditor's Link Feature
       * decided to render the content URL into the text.
       *
       * The corner case, that the name of the content may match the
       * URI representation in CKEditor Model is not relevant, as we would
       * just replace the URI by the name, each being the very same.
       */
      console.warn("TODO: isRawContentLink", {
        text: text,
        parent: text.parent,
        href: href,
        data: text.data,
        matchHref: CONTENT_CKE_MODEL_URI_REGEXP.test(href),
      });
      return CONTENT_CKE_MODEL_URI_REGEXP.test(href) && href === text.data;
    }
    return false;
  }

  /**
   * Replaces the given raw content-link with the name of the content, if
   * it has been previously registered to the name cache.
   *
   * @param writer used to apply the change
   * @param rawContentLink text node to possibly replace
   * @return `true` iff. the text node has been replaced; `false` otherwise
   * @private
   */
  #replaceRawLink(writer: Writer): boolean {
    const logger = ContentLinkCommandHook.#logger;

    const trackedData: TrackedData | undefined = this.#trackingData.clear();

    if (!trackedData) {
      logger.debug(`Skipped replacement as no replacement was registered.`);
      return false;
    }

    // TODO: Continue here, do we need rawContentLink as input?
    const { replacement, contentLink } = trackedData;
    // TODO: The text node may be detached from DOM meanwhile, as it got merged with a previous or following node.
    const { text, href } = contentLink;

    if (replacement.modelUri !== href) {
      logger.debug(`Skipped replacement for '${href}', as registered replacement does not match:`, replacement);
      return false;
    }

    // Empty Name: This signals, that we want to link to the root folder
    // While this is unexpected in editorial context, it is a valid call
    // and thus, must be handled.
    const name: ContentName = replacement.name || "<root>";

    // name !== href: Corner case, when the name really matches the model
    // representation. There is nothing to do then.
    if (name !== href) {
      /*
       * We need to remember the position of the original text. This is because
       * we need to remove the text prior to adding a new one, as otherwise
       * the text nodes will be merged by CKEditor, which again makes it impossible
       * to remove the original text.
       * Prevent to do that again.
       */
      const position = writer.createPositionBefore(text);
      const attrs = text.getAttributes();

      // We first need to remove the text, as otherwise it will be merged with
      // the next text to add.
      writer.remove(text);
      writer.insertText(name, attrs, position);

      return true;
    }

    return false;
  }

  #postFix(writer: Writer): boolean {
    if (this.#trackingData.emptyOrIncomplete()) {
      // We don't have all required data yet, thus, we don't know how to possibly
      // adjust raw content-links. Nothing to do.
      return false;
    }

    console.warn("TODO: postFix");
    const logger = ContentLinkCommandHook.#logger;
    const isTextNodeInsertion = ContentLinkCommandHook.#isTextNodeInsertion;
    const asDiffItemInsert = ContentLinkCommandHook.#asDiffItemInsert;

    const model = writer.model;
    const document = model.document;
    const differ = document.differ;
    const changes = differ.getChanges();

    console.warn("TODO: changes:", {
      changes: changes,
      size: changes.length,
      data: this.#trackingData,
    });

    // TODO: Use the workaround text node to filter and process further

    const textInsertions: DiffItemInsert[] = changes.filter(isTextNodeInsertion).map(asDiffItemInsert);

    console.warn("TODO: relevant texts:", {
      insertedRawContentLinks: textInsertions,
      size: textInsertions.length,
    });

    const matchesTrackingData = textInsertions.some((diffItem) => this.#trackingData.matches(diffItem));

    if (matchesTrackingData) {
      return this.#replaceRawLink(writer);
    }

    return false;
  }

  /**
   * Workaround for not being able to detect the actual text node within the
   * post-fixer.
   *
   * This callback will be triggered prior to the post-fixer, so that the
   * data can be used by the post-fixer as second step.
   *
   * @param args event arguments, will contain text and position as first
   * two arguments for a match
   * @see https://github.com/ckeditor/ckeditor5/issues/10335
   * @private
   */
  #interceptInsertContent(args: unknown[]): void {
    // We expect at least two arguments from `insertContent` triggered by
    // LinkCommand: Text node (with href attribute) and position to insert.
    if (args.length >= 2) {
      const [text, position] = args;

      if (text instanceof Text && position instanceof Position) {
        if (text.hasAttribute(LINK_HREF_MODEL)) {
          const href = <string>text.getAttribute(LINK_HREF_MODEL);
          // We only track data for relevant changes:
          //   - only deal with content-links
          //   - only when we have to work around LinkCommand behavior to insert
          //     the raw `linkHref` attribute value to the text (which is, where
          //     we want to write the content name instead.
          if (CONTENT_CKE_MODEL_URI_REGEXP.test(href) && href === text.data) {
            console.warn("TODO: interceptInsertContent, match!");
            this.#trackingData.contentLink = {
              text: text,
              href: href,
            };
          }
        }
      }
    }
  }
}

export default ContentLinkCommandHook;
