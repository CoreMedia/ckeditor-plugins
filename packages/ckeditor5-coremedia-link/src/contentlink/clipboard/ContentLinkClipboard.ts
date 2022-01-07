import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import {
  extractContentUriPathsFromDragEventJsonData,
  receiveUriPathsFromDragDropService,
} from "@coremedia/ckeditor5-coremedia-studio-integration/content/DragAndDropUtils";
import { serviceAgent } from "@coremedia/service-agent";
import ContentDisplayService from "@coremedia/ckeditor5-coremedia-studio-integration/content/ContentDisplayService";
import ContentDisplayServiceDescriptor from "@coremedia/ckeditor5-coremedia-studio-integration/content/ContentDisplayServiceDescriptor";
import EventInfo from "@ckeditor/ckeditor5-utils/src/eventinfo";
import DragDropAsyncSupport from "@coremedia/ckeditor5-coremedia-studio-integration/content/DragDropAsyncSupport";
import { requireContentCkeModelUri } from "@coremedia/ckeditor5-coremedia-studio-integration/content/UriPath";
import Writer from "@ckeditor/ckeditor5-engine/src/model/writer";
import Range from "@ckeditor/ckeditor5-engine/src/model/range";
import Position from "@ckeditor/ckeditor5-engine/src/model/position";
import { ROOT_NAME } from "../Constants";
import Logger from "@coremedia/ckeditor5-logging/logging/Logger";
import LoggerProvider from "@coremedia/ckeditor5-logging/logging/LoggerProvider";
import { DropCondition } from "./DropCondition";
import { ContentLinkData } from "./ContentLinkData";
import ClipboardEventData from "@ckeditor/ckeditor5-clipboard/src/clipboardobserver";
import Clipboard from "@ckeditor/ckeditor5-clipboard/src/clipboard";

/**
 * Provides support for dragging contents directly into the text. The name of
 * the dragged content will be written at the target position. Dragging multiple
 * contents will create additional block-elements, each containing one
 * content.
 */
export default class ContentLinkClipboard extends Plugin {
  static #CONTENT_LINK_CLIPBOARD_PLUGIN_NAME = "ContentLinkClipboard";
  static #LOGGER: Logger = LoggerProvider.getLogger(ContentLinkClipboard.#CONTENT_LINK_CLIPBOARD_PLUGIN_NAME);

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
    const logger = ContentLinkClipboard.#LOGGER;

    // The clipboard content was already processed by the listener on the higher priority
    // (for example while pasting into the code block).
    if (data.content) {
      return;
    }

    const cmDataUris = ContentLinkClipboard.#extractContentUris(data);

    if (!cmDataUris) {
      return;
    }

    evt.stop();
    logger.debug("Content links dropped.", {
      dataUris: cmDataUris,
    });
    if (cmDataUris.length > 0) {
      const dropCondition = ContentLinkClipboard.#createDropCondition(editor, data, cmDataUris);

      logger.debug("Calculated drop condition.", { condition: dropCondition });

      serviceAgent
        .fetchService<ContentDisplayService>(new ContentDisplayServiceDescriptor())
        .then((contentDisplayService: ContentDisplayService): void => {
          ContentLinkClipboard.#makeContentNameRequests(contentDisplayService, editor, dropCondition, cmDataUris);
        });
    }
  };

  static get pluginName(): string {
    return ContentLinkClipboard.#CONTENT_LINK_CLIPBOARD_PLUGIN_NAME;
  }

  static get requires(): Array<new (editor: Editor) => Plugin> {
    return [Clipboard];
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
    this.listenTo(viewDocument, "dragover", ContentLinkClipboard.#dragOverHandler);
  }

  destroy(): null {
    const editor = this.editor;
    const view = editor.editing.view;
    const viewDocument = view.document;

    this.stopListening(viewDocument, "clipboardInput", this.#clipboardInputHandler);
    this.stopListening(viewDocument, "dragover", ContentLinkClipboard.#dragOverHandler);
    return null;
  }

  /**
   * Extract content-URIs from clipboard. Content-URIs are stored within
   * `cm/uri-list` and contain the URIs in the form `content/42` (wrapped
   * by some JSON).
   *
   * @param data data to get content URIs from
   * @returns array of content-URIs, possibly empty; `null` signals, that the data did not contain content-URI data
   * @private
   */
  static #extractContentUris(data: ClipboardEventData): string[] | null {
    if (data === null || data.dataTransfer === null) {
      return null;
    }

    const cmUriList = data.dataTransfer.getData("cm/uri-list");

    if (!cmUriList) {
      return null;
    }
    return extractContentUriPathsFromDragEventJsonData(cmUriList);
  }

  /**
   * Trigger to receive names of all contents to eventually write them all to
   * CKEditor.
   *
   * All names must be resolved prior to writing them to CKEditor, as name
   * queries of for example last document may return earlier than the first
   * one.
   *
   * @param contentDisplayService service to use to resolve names
   * @param editor editor to write linked contents to
   * @param dropCondition meta-data of current drop event
   * @param cmDataUris data URIs to write links for
   * @private
   */
  static #makeContentNameRequests(
    contentDisplayService: ContentDisplayService,
    editor: Editor,
    dropCondition: DropCondition,
    cmDataUris: string[]
  ): void {
    const namePromises = cmDataUris.map<Promise<string>>((uri: string): Promise<string> => {
      return contentDisplayService.name(uri);
    });
    Promise.all(namePromises).then((contentNames: string[]) => {
      ContentLinkClipboard.#LOGGER.debug(JSON.stringify(contentNames));
      for (const index in contentNames) {
        if (!contentNames.hasOwnProperty(index) || !cmDataUris.hasOwnProperty(index)) {
          continue;
        }
        const contentName = contentNames[index] ? contentNames[index] : ROOT_NAME;
        const contentUri = cmDataUris[index];
        const href = requireContentCkeModelUri(contentUri);
        const isLast = cmDataUris.length - 1 === Number(index);
        const isFirst = Number(index) === 0;
        const linkData = new ContentLinkData(isFirst, isLast, contentName, contentUri, href);
        ContentLinkClipboard.#handleContentNameResponse(editor, dropCondition, linkData);
      }
    });
  }

  static #handleContentNameResponse(editor: Editor, dropCondition: DropCondition, linkData: ContentLinkData): void {
    ContentLinkClipboard.#LOGGER.debug("Rendering link: " + JSON.stringify({ linkData, dropCondition }));
    const isLinkableContent = DragDropAsyncSupport.isLinkable(linkData.contentUri, true);
    if (!isLinkableContent) {
      return;
    }
    ContentLinkClipboard.#writeLink(editor, dropCondition, linkData);
  }

  static #writeLink(editor: Editor, dropCondition: DropCondition, linkData: ContentLinkData): void {
    if (dropCondition.multipleContentDrop) {
      ContentLinkClipboard.#writeLinkInOwnParagraph(editor, dropCondition, linkData);
    } else {
      ContentLinkClipboard.#writeLinkInline(editor, linkData.href, linkData.text, dropCondition);
    }
  }

  static #writeLinkInline(editor: Editor, href: string, linkText: string, dropCondition: DropCondition): void {
    const logger = ContentLinkClipboard.#LOGGER;

    editor.model.change((writer: Writer) => {
      try {
        if (dropCondition.targetRange) {
          writer.setSelection(dropCondition.targetRange);
        }
        const firstPosition = editor.model.document.selection.getFirstPosition();
        if (firstPosition === null) {
          return;
        }
        writer.overrideSelectionGravity();
        const linkElement = writer.createText(linkText, { linkHref: href });
        writer.insert(linkElement, firstPosition);
        const positionAfterText = writer.createPositionAfter(linkElement);
        const textRange = writer.createRange(firstPosition, positionAfterText);
        ContentLinkClipboard.#setSelectionAttributes(writer, [textRange], dropCondition.selectedAttributes);
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
  static #writeLinkInOwnParagraph(editor: Editor, dropCondition: DropCondition, linkData: ContentLinkData): void {
    const logger = ContentLinkClipboard.#LOGGER;

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

        const textRange = ContentLinkClipboard.#insertLink(writer, actualPosition, dropCondition, linkData);
        ContentLinkClipboard.#setSelectionAttributes(writer, [textRange], dropCondition.selectedAttributes);
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
    linkData: ContentLinkData
  ): Range {
    const isFirstDocumentPosition = ContentLinkClipboard.#isFirstPositionOfDocument(cursorPosition);
    const text = writer.createText(linkData.text, {
      linkHref: linkData.href,
    });
    let textStartPosition;
    if (isFirstDocumentPosition || (dropCondition.dropAtStartOfBlock && linkData.isFirstInsertedLink)) {
      textStartPosition = cursorPosition;
      writer.insert(text, cursorPosition);
    } else {
      const split = writer.split(cursorPosition);
      textStartPosition = split.range.end;
      writer.insert(text, split.range.end);
    }
    const afterTextPosition = writer.createPositionAt(text, "after");
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
    const targetRange = ContentLinkClipboard.#evaluateTargetRange(editor, data);
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
