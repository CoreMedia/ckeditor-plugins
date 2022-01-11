import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import Logger from "@coremedia/ckeditor5-logging/logging/Logger";
import LoggerProvider from "@coremedia/ckeditor5-logging/logging/LoggerProvider";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import Clipboard from "@ckeditor/ckeditor5-clipboard/src/clipboard";
import { receiveUriPathsFromDragDropService } from "@coremedia/ckeditor5-coremedia-studio-integration/content/DragAndDropUtils";
import DragDropAsyncSupport from "@coremedia/ckeditor5-coremedia-studio-integration/content/DragDropAsyncSupport";
import Range from "@ckeditor/ckeditor5-engine/src/model/range";
import EventInfo from "@ckeditor/ckeditor5-utils/src/eventinfo";
import ClipboardEventData from "@ckeditor/ckeditor5-clipboard/src/clipboardobserver";
import { DropCondition } from "./DropCondition";
import PlaceholderDataCache, { PlaceholderData } from "./PlaceholderDataCache";
import CoreMediaClipboardUtils from "./CoreMediaClipboardUtils";
import ContentPlaceholderEditing from "./ContentPlaceholderEditing";
import { ContentClipboardMarkerUtils } from "./ContentClipboardMarkerUtils";
import Writer from "@ckeditor/ckeditor5-engine/src/model/writer";
import Batch from "@ckeditor/ckeditor5-engine/src/model/batch";
import UndoEditing from "@ckeditor/ckeditor5-undo/src/undoediting";
import CommandUtils from "./CommandUtils";

export default class ContentClipboard extends Plugin {
  static #CONTENT_CLIPBOARD_PLUGIN_NAME = "ContentClipboardPlugin";
  static #LOGGER: Logger = LoggerProvider.getLogger(ContentClipboard.#CONTENT_CLIPBOARD_PLUGIN_NAME);

  static get pluginName(): string {
    return ContentClipboard.#CONTENT_CLIPBOARD_PLUGIN_NAME;
  }

  static get requires(): Array<new (editor: Editor) => Plugin> {
    return [Clipboard, ContentPlaceholderEditing, UndoEditing];
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

  /**
   * Drag-over handler to control drop-effect icons, which is, to forbid for
   * any content-sets containing types which are not allowed to be linked.
   *
   * @param evt event information
   * @param data clipboard data
   */
  static #dragOverHandler(evt: EventInfo, data: ClipboardEventData): void {
    // The clipboard content was already processed by the listener on the higher priority
    // (for example while pasting into the code block).
    if (data.content) {
      return;
    }
    const cmDataUris = receiveUriPathsFromDragDropService();
    if (!cmDataUris) {
      return;
    }
    const containsDisplayableContents = DragDropAsyncSupport.containsDisplayableContents(cmDataUris);
    if (containsDisplayableContents) {
      data.dataTransfer.dropEffect = "copy";
    } else {
      data.dataTransfer.dropEffect = "none";
      evt.stop();
    }
  }

  #clipboardInputHandler = (evt: EventInfo, data: ClipboardEventData): void => {
    const editor = this.editor;
    const cmDataUris: string[] | null = CoreMediaClipboardUtils.extractContentUris(data);

    if (!cmDataUris || cmDataUris.length === 0) {
      return;
    }

    const dropCondition = ContentClipboard.#createDropCondition(editor, data, cmDataUris);
    const dropId = Date.now();
    const batch = editor.model.createBatch();
    CommandUtils.disableCommand(editor, "undo");
    editor.model.enqueueChange("transparent", (writer: Writer) => {
      writer.setSelection(dropCondition.targetRange);
    });
    const attributes = Array.from(editor.model.document.selection.getAttributes());
    cmDataUris.forEach((contentUri: string, index: number, originalArray: string[]): void => {
      const isEmbeddableContent = DragDropAsyncSupport.isEmbeddable(contentUri, true);
      ContentClipboard.#addMarkerAsPlaceholder(editor, dropCondition, contentUri, dropId, index, originalArray.length, isEmbeddableContent, batch, attributes);
    });
  };

  /**
   * Create meta-data from drop event.
   *
   * @param editor current editor instance
   * @param data event data
   * @param links links which shall be written
   * @private
   */
  static #createDropCondition(editor: Editor, data: ClipboardEventData, links: string[]): DropCondition {
    const targetRange = ContentClipboard.#evaluateTargetRange(editor, data);
    return new DropCondition(targetRange);
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

  static #addMarkerAsPlaceholder(editor: Editor, dropCondition: DropCondition, contentUri: string, dropId: number, index: number, numberOfDroppedItems: number, isEmbeddableContent: boolean, batch: Batch, attributes: [string, (string | number | boolean)][]): void {
    ContentClipboard.#LOGGER.debug("Rendering link: " + JSON.stringify({ contentUri, dropCondition }));
    editor.model.enqueueChange("transparent", (writer: Writer) => {
      const targetRange = dropCondition.targetRange;
      if (!targetRange) {
        return;
      }
      const markerName: string = ContentClipboardMarkerUtils.toMarkerName("content", dropId, index);
      writer.addMarker(markerName, { usingOperation: true, range: targetRange });
      const data: PlaceholderData = {
        batch: batch,
        contentUri: contentUri,
        isEmbeddableContent: isEmbeddableContent,
        selectedAttributes: attributes,
        dropContext: {
          index: index,
          multipleItemsDropped: numberOfDroppedItems > 1,
        }
      }
      PlaceholderDataCache.storeData(markerName, data);
    });
  }
}
