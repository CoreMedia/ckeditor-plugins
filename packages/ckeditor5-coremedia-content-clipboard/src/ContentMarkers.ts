import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import ModelRange from "@ckeditor/ckeditor5-engine/src/model/range";
import Writer from "@ckeditor/ckeditor5-engine/src/model/writer";
import ContentDropDataCache, { ContentDropData, DropContext } from "./ContentDropDataCache";
import DragDropAsyncSupport from "@coremedia/ckeditor5-coremedia-studio-integration/content/DragDropAsyncSupport";
import { ContentClipboardMarkerDataUtils } from "./ContentClipboardMarkerDataUtils";
import LoggerProvider from "@coremedia/ckeditor5-logging/logging/LoggerProvider";

const logger = LoggerProvider.getLogger("ContentMarkers");

/**
 * Inserts a marker for each given uri.
 *
 * @param editor - the editor
 * @param targetRange - the range to insert the contents to
 * @param contentUris - the uris to insert
 */
export const insertContentMarkers = (editor: Editor, targetRange: ModelRange, contentUris: string[]): void => {
  const { model } = editor;

  model.enqueueChange({ isUndoable: false }, (writer: Writer) => {
    writer.setSelection(targetRange);
  });

  const batch = model.createBatch();

  // Save the attributes of the current selection to apply them later on the
  // input element.
  const attributes = Array.from(model.document.selection.getAttributes());

  // Use the current timestamp as the contentInputId to mark multiple Contents as part of one insertion.
  // Multiple insertions might happen at the same time and maybe even at the same position (e.g. for slower loading contents).
  // By adding a timestamp for each insertion, those situations can be handled.
  const dropId = Date.now();
  const multipleItemsDropped = contentUris.length > 1;
  const dropContext: DropContext = {
    dropId,
    batch,
    selectedAttributes: attributes,
  };

  // Add a drop marker for each item.
  contentUris.forEach((contentUri: string, index: number): void => {
    // This only works because we are in a drag context and the result has
    // already been computed and cached. Calling this function without a
    // present cache entry for the given contentUri will probably result in a
    // wrong value.
    const isEmbeddableContent = DragDropAsyncSupport.isEmbeddable(contentUri, true);
    const contentDropData = createContentDropData(
      dropContext,
      contentUri,
      !isEmbeddableContent && !multipleItemsDropped,
      index
    );
    addContentDropMarker(editor, targetRange, contentDropData);
  });
};

/**
 * Creates a ContentDropData object.
 *
 * @param dropContext - dropContext
 * @param contentUri - the content-URI of the input item
 * @param isInline - determines whether the item will be displayed inline or
 * as new paragraph
 * @param itemIndex - the position of the item inside the drop
 * @returns ContentDropData
 */
const createContentDropData = (
  dropContext: DropContext,
  contentUri: string,
  isInline: boolean,
  itemIndex: number
): ContentDropData => {
  return {
    dropContext,
    itemContext: {
      contentUri,
      itemIndex,
      isInline,
    },
  };
};

/**
 * Adds a marker to the editors model.
 *
 * A marker indicates the position of an input item, which can then be
 * displayed in the editing view, but will not be written into the data view.
 * This function also stores data for the dropped item (contentDropData) to
 * the ContentDropDataCache.
 *
 * @param editor - the editor
 * @param markerRange - the marker range
 * @param contentDropData - content drop data
 */
const addContentDropMarker = (editor: Editor, markerRange: ModelRange, contentDropData: ContentDropData): void => {
  const markerName: string = ContentClipboardMarkerDataUtils.toMarkerName(
    contentDropData.dropContext.dropId,
    contentDropData.itemContext.itemIndex
  );
  logger.debug("Adding content-drop marker", markerName, contentDropData);
  editor.model.enqueueChange({ isUndoable: false }, (writer: Writer) => {
    writer.addMarker(markerName, { usingOperation: true, range: markerRange });
    ContentDropDataCache.storeData(markerName, contentDropData);
  });
};
