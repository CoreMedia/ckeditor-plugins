import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import { receiveUriPathsFromDragDropService } from "@coremedia/ckeditor5-coremedia-studio-integration/content/DragAndDropUtils";
import EventInfo from "@ckeditor/ckeditor5-utils/src/eventinfo";
import DragDropAsyncSupport from "@coremedia/ckeditor5-coremedia-studio-integration/content/DragDropAsyncSupport";
import Writer from "@ckeditor/ckeditor5-engine/src/model/writer";
import Range from "@ckeditor/ckeditor5-engine/src/model/range";
import Position from "@ckeditor/ckeditor5-engine/src/model/position";
import Logger from "@coremedia/ckeditor5-logging/logging/Logger";
import LoggerProvider from "@coremedia/ckeditor5-logging/logging/LoggerProvider";
import { DropCondition } from "./DropCondition";
import { ContentData } from "./ContentData";
import ClipboardEventData from "@ckeditor/ckeditor5-clipboard/src/clipboardobserver";
import Clipboard from "@ckeditor/ckeditor5-clipboard/src/clipboard";
import CoreMediaClipboardUtils from "@coremedia/ckeditor5-coremedia-dragdrop-utils/CoreMediaClipboardUtils";
import ContentPlaceholder from "../content/ContentPlaceholder";
import EmbeddedBlob from "../embeddedblobs/EmbeddedBlob";
import BatchCache from "../batchcache/BatchCache";

/**
 * Provides support for dragging contents directly into the text. The name of
 * the dragged content will be written at the target position. Dragging multiple
 * contents will create additional block-elements, each containing one
 * content.
 */
export default class ContentClipboard extends Plugin {
  static #CONTENT_LINK_CLIPBOARD_PLUGIN_NAME = "ContentLinkClipboard";
  static #LOGGER: Logger = LoggerProvider.getLogger(ContentClipboard.#CONTENT_LINK_CLIPBOARD_PLUGIN_NAME);

  /**
   * Drag-over handler to control drop-effect icons, which is, to forbid for
   * any content-sets containing types which are not allowed to be linked.
   *
   * @param evt event information
   * @param data clipboard data
   */
  static readonly #dragOverHandler = (evt: EventInfo, data: ClipboardEventData): void => {
    // The clipboard content was already processed by the listener on the higher priority
    // (for example while pasting into the code block).
    if (data.content) {
      return;
    }
    const cmDataUris = receiveUriPathsFromDragDropService();
    if (!cmDataUris) {
      return;
    }
    const containOnlyLinkables = DragDropAsyncSupport.containsDisplayableContents(cmDataUris);
    if (containOnlyLinkables) {
      data.dataTransfer.dropEffect = "copy";
    } else {
      data.dataTransfer.dropEffect = "none";
      evt.stop();
    }
  };

  /**
   * Drop handler, to write name of content into CKEditor.
   *
   * @param evt event information
   * @param data clipboard data
   */
  readonly #clipboardInputHandler = (evt: EventInfo, data: ClipboardEventData): void => {
    const editor = this.editor;
    const logger = ContentClipboard.#LOGGER;

    // The clipboard content was already processed by the listener on the higher priority
    // (for example while pasting into the code block).
    if (data.content) {
      return;
    }

    const cmDataUris = CoreMediaClipboardUtils.extractContentUris(data);

    if (!cmDataUris) {
      return;
    }

    evt.stop();
    logger.debug("Content links dropped.", {
      dataUris: cmDataUris,
    });
    if (cmDataUris.length > 0) {
      const dropCondition = ContentClipboard.#createDropCondition(editor, data, cmDataUris);

      logger.debug("Calculated drop condition.", { condition: dropCondition });

      cmDataUris.forEach((contentUri: string, index: number, originalArray: string[]): void => {
        const isLast = originalArray.length - 1 === Number(index);
        const isFirst = Number(index) === 0;
        const isLinkableContent = DragDropAsyncSupport.isLinkable(contentUri, true);
        const isEmbeddableContent = DragDropAsyncSupport.isEmbeddable(contentUri, true);
        const linkData = new ContentData(isFirst, isLast, contentUri, isLinkableContent, isEmbeddableContent);
        ContentClipboard.#writeLink(editor, dropCondition, linkData);
      });
    }
  };

  static get pluginName(): string {
    return ContentClipboard.#CONTENT_LINK_CLIPBOARD_PLUGIN_NAME;
  }

  static get requires(): Array<new (editor: Editor) => Plugin> {
    return [Clipboard, EmbeddedBlob, ContentPlaceholder];
  }

  init(): Promise<void> | null {
    this.#initEventListeners();
    return null;
  }

  /**
   * Adds a listener to `clipboardInput` to process possibly dragged contents.
   * @private
   */
  #initEventListeners(): void {
    const editor = this.editor;
    const view = editor.editing.view;
    const viewDocument = view.document;

    // Processing pasted or dropped content.
    this.listenTo(viewDocument, "clipboardInput", this.#clipboardInputHandler);
    this.listenTo(viewDocument, "dragover", ContentClipboard.#dragOverHandler);
  }

  destroy(): null {
    const editor = this.editor;
    const view = editor.editing.view;
    const viewDocument = view.document;

    this.stopListening(viewDocument, "clipboardInput", this.#clipboardInputHandler);
    this.stopListening(viewDocument, "dragover", ContentClipboard.#dragOverHandler);
    return null;
  }

  static #writeLink(editor: Editor, dropCondition: DropCondition, linkData: ContentData): void {
    ContentClipboard.#LOGGER.debug("Rendering link: " + JSON.stringify({ linkData, dropCondition }));
    if (!linkData.isLinkable && !linkData.isEmbeddable) {
      return;
    }
    if (dropCondition.multipleContentDrop) {
      ContentClipboard.#writeLinkInOwnParagraph(editor, dropCondition, linkData);
    } else {
      ContentClipboard.#writeLinkInline(editor, linkData, dropCondition);
    }
  }

  static #writeLinkInline(editor: Editor, linkData: ContentData, dropCondition: DropCondition): void {
    const logger = ContentClipboard.#LOGGER;

    editor.model.change((writer: Writer) => {
      try {
        if (dropCondition.targetRange) {
          writer.setSelection(dropCondition.targetRange);
        }
        const firstPosition = editor.model.document.selection.getFirstPosition();
        if (firstPosition === null) {
          return;
        }
        const contentPlaceholderId = "" + Math.random();
        BatchCache.storeBatch(contentPlaceholderId, writer.batch);

        writer.overrideSelectionGravity();
        let position = firstPosition;
        if (linkData.isEmbeddable) {
          const split = writer.split(firstPosition);
          position = split.range.end;
          writer.setSelection(position);
        }
        const coremediaContent = writer.createElement("content-placeholder", {
          contentUri: linkData.contentUri,
          isLinkable: linkData.isLinkable,
          isEmbeddable: linkData.isEmbeddable,
          inline: true,
          placeholderId: contentPlaceholderId,
        });
        writer.insert(coremediaContent, position);
        const positionAfterText = writer.createPositionAfter(coremediaContent);
        const textRange = writer.createRange(position, positionAfterText);
        ContentClipboard.#setSelectionAttributes(writer, [textRange], dropCondition.selectedAttributes);
        if (linkData.isEmbeddable) {
          const split = writer.split(positionAfterText);
          writer.setSelection(split.range.end);
        }
      } catch (e) {
        //Insert a content link to the end of the document which takes a long time to load the name and remove the last word.
        //This leads to an error because the position the link should be inserted to is invalid now.
        //Probably an edge case as we assume fast answers
        const msg = "An error occurred, probably the document has been edited while waiting for insertion of a link.";
        const dbgHint = "Further information in debug output.";
        logger.warn(`${msg} ${dbgHint}`);
        logger.debug(msg, e);
      }
    });
  }

  /**
   * Writes the link in its own block element, like for example a paragraph or
   * list item.
   *
   * @param editor editor to write to
   * @param dropCondition meta-information for drop-event
   * @param linkData data of the link to write
   * @private
   */
  static #writeLinkInOwnParagraph(editor: Editor, dropCondition: DropCondition, linkData: ContentData): void {
    const logger = ContentClipboard.#LOGGER;

    editor.model.change((writer: Writer) => {
      try {
        // When dropping, the drop position is stored as range but the cursor is not yet updated to the drop position
        // We can only set the cursor inside a model.change so we have to do it here. If it is not the first inserted link
        // during a multiple we assume that the latest inserted link has set the cursor at its end.
        if (linkData.isFirstInsertedLink && dropCondition.targetRange) {
          writer.setSelection(dropCondition.targetRange);
        }
        const actualPosition = editor.model.document.selection.getFirstPosition();
        if (actualPosition === null) {
          return;
        }

        const textRange = ContentClipboard.#insertLink(writer, actualPosition, dropCondition, linkData);
        ContentClipboard.#setSelectionAttributes(writer, [textRange], dropCondition.selectedAttributes);
        if (linkData.isLastInsertedLink && !dropCondition.dropAtEndOfBlock) {
          //Finish with a new line if the contents are dropped into an inline position
          const secondSplit = writer.split(textRange.end);
          writer.setSelection(secondSplit.range.end);
        } else {
          if (linkData.isLastInsertedLink) {
            //If we drop to the end of the document we do not end in the next paragraph so we have to make sure that we do not
            //end in the link tag to not proceed the link when typing.
            writer.overrideSelectionGravity();
          }
          writer.setSelection(textRange.end);
        }
      } catch (e) {
        //Insert a content link to the end of the document which takes a long time to load the name and remove the last word.
        //This leads to an error because the position the link should be inserted to is invalid now.
        //Probably an edge case as we assume fast answers
        const msg = "An error occurred, probably the document has been edited while waiting for insertion of a link.";
        const dbgHint = "Further information in debug output.";
        logger.warn(`${msg} ${dbgHint}`);
        logger.debug(msg, e);
      }
    });
  }

  /**
   * Writes given link at the given position, returning the range of the new
   * text.
   *
   * @param writer writer to use
   * @param cursorPosition cursor position to write link to
   * @param dropCondition meta-data of drop event
   * @param linkData data describing the link to write
   * @private
   */
  static #insertLink(
    writer: Writer,
    cursorPosition: Position,
    dropCondition: DropCondition,
    linkData: ContentData
  ): Range {
    const isFirstDocumentPosition = ContentClipboard.#isFirstPositionOfDocument(cursorPosition);
    const coremediaContent = writer.createElement("content-placeholder", {
      contentUri: linkData.contentUri,
      isLinkable: linkData.isLinkable,
      isEmbeddable: linkData.isEmbeddable,
      inline: false,
      placeholderId: "" + Math.random(),
    });
    let textStartPosition;
    if (isFirstDocumentPosition || (dropCondition.dropAtStartOfBlock && linkData.isFirstInsertedLink)) {
      textStartPosition = cursorPosition;
      writer.model.insertContent(coremediaContent, cursorPosition);
    } else {
      const split = writer.split(cursorPosition);
      textStartPosition = split.range.end;
      writer.model.insertContent(coremediaContent, split.range.end);
    }
    const afterTextPosition = writer.createPositionAt(coremediaContent, "after");
    return writer.createRange(textStartPosition, afterTextPosition);
  }

  /**
   * Applies selection attributes to the given ranges.
   *
   * @param writer writer to use
   * @param textRanges ranges to apply selection attributes to
   * @param attributes selection attributes to apply
   * @private
   */
  static #setSelectionAttributes(
    writer: Writer,
    textRanges: Range[],
    attributes: [string, string | number | boolean][]
  ): void {
    for (const attribute of attributes) {
      for (const range of textRanges) {
        writer.setAttribute(attribute[0], attribute[1], range);
      }
    }
  }

  /**
   * Checks, if position is the first one in document.
   * @param position position to check
   * @private
   */
  static #isFirstPositionOfDocument(position: Position): boolean {
    const path = position.getCommonPath(position);
    for (const pathElement of path) {
      if (pathElement !== 0) {
        return false;
      }
    }
    return true;
  }

  /**
   * Create meta-data from drop event.
   *
   * @param editor current editor instance
   * @param data event data
   * @param links links which shall be written
   * @private
   */
  static #createDropCondition(editor: Editor, data: ClipboardEventData, links: string[]): DropCondition {
    const multipleContentDrop = links.length > 1;
    const targetRange = ContentClipboard.#evaluateTargetRange(editor, data);
    const initialDropAtStartOfParagraph = targetRange ? targetRange.start.isAtStart : false;
    const initialDropAtEndOfParagraph = targetRange ? targetRange.end.isAtEnd : false;
    const attributes = editor.model.document.selection.getAttributes();
    return new DropCondition(
      multipleContentDrop,
      initialDropAtEndOfParagraph,
      initialDropAtStartOfParagraph,
      targetRange,
      Array.from(attributes)
    );
  }

  /**
   * Evaluate target range. `null` if no range could be determined.
   *
   * @param editor current editor instance
   * @param data event data
   * @private
   */
  static #evaluateTargetRange(editor: Editor, data: ClipboardEventData): Range | null {
    if (!data.targetRanges) {
      return null;
    }
    const targetRanges: Range[] = data.targetRanges.map((viewRange: Range): Range => {
      return editor.editing.mapper.toModelRange(viewRange);
    });
    if (targetRanges.length > 0) {
      return targetRanges[0];
    }
    return null;
  }
}
