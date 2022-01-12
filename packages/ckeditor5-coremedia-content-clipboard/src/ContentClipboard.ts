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
import ContentDropDataCache, { ContentDropData, DropContext } from "./ContentDropDataCache";
import CoreMediaClipboardUtils from "./CoreMediaClipboardUtils";
import ContentPlaceholderEditing from "./ContentPlaceholderEditing";
import { ContentClipboardMarkerUtils } from "./ContentClipboardMarkerUtils";
import Writer from "@ckeditor/ckeditor5-engine/src/model/writer";
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

    const targetRange = ContentClipboard.#evaluateTargetRange(editor, data);
    if (!targetRange) {
      return;
    }
    CommandUtils.disableCommand(editor, "undo");
    editor.model.enqueueChange("transparent", (writer: Writer) => {
      writer.setSelection(targetRange);
    });

    const batch = editor.model.createBatch();
    const attributes = Array.from(editor.model.document.selection.getAttributes());
    const dropId = Date.now();
    const dropContext: DropContext = {
      dropId,
      batch,
      multipleItemsDropped: cmDataUris.length > 1,
      selectedAttributes: attributes
    }

    cmDataUris.forEach((contentUri: string, index: number): void => {
      const isEmbeddableContent = DragDropAsyncSupport.isEmbeddable(contentUri, true);
      const contentDropData = ContentClipboard.#createContentDropData(dropContext, contentUri, isEmbeddableContent, index);
      ContentClipboard.#addContentDropMarker(editor, targetRange, contentDropData);
    });
  };

  static #addContentDropMarker(editor: Editor, markerRange: Range, contentDropData: ContentDropData): void {
    const markerName: string = ContentClipboardMarkerUtils.toMarkerName(contentDropData.dropContext.dropId, contentDropData.itemContext.itemIndex);
    ContentClipboard.#LOGGER.debug("Adding content-drop marker", markerName, contentDropData);
    editor.model.enqueueChange("transparent", (writer: Writer) => {
      writer.addMarker(markerName, { usingOperation: true, range: markerRange });
      ContentDropDataCache.storeData(markerName, contentDropData);
    });
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
      return editor.model.document.selection.getFirstRange()
    }
    const targetRanges: Range[] = data.targetRanges.map((viewRange: Range): Range => {
      return editor.editing.mapper.toModelRange(viewRange);
    });
    if (targetRanges.length > 0) {
      return targetRanges[0];
    }
    return null;
  }

  static #createContentDropData(dropContext: DropContext, contentUri: string, isEmbeddableContent: boolean, itemIndex: number): ContentDropData {
    return {
      dropContext,
      itemContext: {
        contentUri,
        itemIndex,
        isEmbeddableContent
      }
    }
  }
}
