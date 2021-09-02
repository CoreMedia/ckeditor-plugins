import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import {
  extractContentUriPathsFromDragEventJsonData,
  receiveUriPathsFromDragDropService,
} from "@coremedia/coremedia-studio-integration/content/DragAndDropUtils";
import { serviceAgent } from "@coremedia/studio-apps-service-agent";
import ContentDisplayService from "@coremedia/coremedia-studio-integration/content/ContentDisplayService";
import ContentDisplayServiceDescriptor from "@coremedia/coremedia-studio-integration/content/ContentDisplayServiceDescriptor";
import EventInfo from "@ckeditor/ckeditor5-utils/src/eventinfo";
import DragDropAsyncSupport from "@coremedia/coremedia-studio-integration/content/DragDropAsyncSupport";
import { requireContentCkeModelUri } from "@coremedia/coremedia-studio-integration/content/UriPath";
import Writer from "@ckeditor/ckeditor5-engine/src/model/writer";
import Range from "@ckeditor/ckeditor5-engine/src/model/range";
import Position from "@ckeditor/ckeditor5-engine/src/model/position";
import { ROOT_NAME } from "../Constants";
import Logger from "@coremedia/coremedia-utils/logging/Logger";
import LoggerProvider from "@coremedia/coremedia-utils/logging/LoggerProvider";
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

  static get pluginName(): string {
    return ContentLinkClipboard.#CONTENT_LINK_CLIPBOARD_PLUGIN_NAME;
  }

  static get requires(): Array<new (editor: Editor) => Plugin> {
    return [Clipboard];
  }

  init(): Promise<void> | null {
    this.#defineClipboardInputOutput();
    return null;
  }

  /**
   * Adds a listener to `clipboardInput` to process possibly dragged contents.
   * @private
   */
  #defineClipboardInputOutput(): void {
    const editor = this.editor;
    const view = editor.editing.view;
    const viewDocument = view.document;
    const logger = ContentLinkClipboard.#LOGGER;

    // Processing pasted or dropped content.
    this.listenTo(viewDocument, "clipboardInput", (evt, data) => {
      // The clipboard content was already processed by the listener on the higher priority
      // (for example while pasting into the code block).
      if (data.content) {
        return;
      }

      const cmDataUris = ContentLinkClipboard.#extractContentUris(data);

      logger.debug("Content links dropped.", {
        dataUris: cmDataUris,
      });

      if (cmDataUris) {
        //If it is a content link we have to handle the event asynchronously to fetch data like the content name from a remote service.
        //Therefore we have to stop the event, otherwise we would have to treat the event synchronously.
        evt.stop();

        if (cmDataUris.length > 0) {
          const dropCondition = ContentLinkClipboard.#createDropCondition(editor, data, cmDataUris);

          if (logger.isDebugEnabled()) {
            logger.debug("Calculated drop condition.", { condition: JSON.stringify(dropCondition) });
          }

          serviceAgent
            .fetchService<ContentDisplayService>(new ContentDisplayServiceDescriptor())
            .then((contentDisplayService: ContentDisplayService): void => {
              ContentLinkClipboard.#makeContentNameRequests(contentDisplayService, editor, dropCondition, cmDataUris);
            });
        }

        return;
      }
    });

    this.listenTo(viewDocument, "dragover", (evt: EventInfo, data) => {
      // The clipboard content was already processed by the listener on the higher priority
      // (for example while pasting into the code block).
      if (data.content) {
        return;
      }
      const cmDataUris = receiveUriPathsFromDragDropService();
      if (!cmDataUris) {
        return;
      }
      const containOnlyLinkables = DragDropAsyncSupport.containsOnlyLinkables(cmDataUris);
      if (containOnlyLinkables) {
        data.dataTransfer.dropEffect = "copy";
      } else {
        data.dataTransfer.dropEffect = "none";
        evt.stop();
      }
    });
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
  static #extractContentUris(data: ClipboardEventData): Array<string> | null {
    if (data === null || data.dataTransfer === null) {
      return null;
    }

    const cmUriList = data.dataTransfer.getData("cm/uri-list");

    if (!cmUriList) {
      return null;
    }
    return extractContentUriPathsFromDragEventJsonData(cmUriList);
  }

  static #makeContentNameRequests(
    contentDisplayService: ContentDisplayService,
    editor: Editor,
    dropCondition: DropCondition,
    cmDataUris: Array<string>
  ): void {
    const namePromises = cmDataUris.map<Promise<string>>((uri: string): Promise<string> => {
      return contentDisplayService.name(uri);
    });
    Promise.all(namePromises).then((contentNames: Array<string>) => {
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
        ContentLinkClipboard.#LOGGER.debug(e);
        ContentLinkClipboard.#LOGGER.warn(
          "An error occured, probably the document has been edited while waiting for insertion of a link. Further informations in debug output"
        );
      }
    });
  }

  static #writeLinkInOwnParagraph(editor: Editor, dropCondition: DropCondition, linkData: ContentLinkData): void {
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
        if (linkData.isLastInsertedLink && !dropCondition.dropAtEnd) {
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
        ContentLinkClipboard.#LOGGER.debug(e);
        ContentLinkClipboard.#LOGGER.warn(
          "An error occured, probably the document has been edited while waiting for insertion of a link. Further informations in debug output"
        );
      }
    });
  }

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
    if (isFirstDocumentPosition || (dropCondition.dropAtStart && linkData.isFirstInsertedLink)) {
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

  static #setSelectionAttributes(
    writer: Writer,
    textRange: Array<Range>,
    attributes: Array<[string, string | number | boolean]>
  ): void {
    for (const attribute of attributes) {
      for (const range of textRange) {
        writer.setAttribute(attribute[0], attribute[1], range);
      }
    }
  }

  static #isFirstPositionOfDocument(position: Position): boolean {
    const path = position.getCommonPath(position);
    for (const pathElement of path) {
      if (pathElement !== 0) {
        return false;
      }
    }
    return true;
  }

  static #createDropCondition(editor: Editor, data: ClipboardEventData, links: Array<string>): DropCondition {
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

  static #evaluateTargetRange(editor: Editor, data: ClipboardEventData): Range | null {
    if (!data.targetRanges) {
      return null;
    }
    const targetRanges: Array<Range> = data.targetRanges.map((viewRange: Range): Range => {
      return editor.editing.mapper.toModelRange(viewRange);
    });
    if (targetRanges.length > 0) {
      return targetRanges[0];
    }
    return null;
  }
}
