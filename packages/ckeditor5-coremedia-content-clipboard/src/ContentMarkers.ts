import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import ModelRange from "@ckeditor/ckeditor5-engine/src/model/range";
import Writer from "@ckeditor/ckeditor5-engine/src/model/writer";
import ContentInputDataCache, { ContentInputData, InsertionContext } from "./ContentInputDataCache";
import { ContentClipboardMarkerDataUtils } from "./ContentClipboardMarkerDataUtils";
import LoggerProvider from "@coremedia/ckeditor5-logging/logging/LoggerProvider";
import { serviceAgent } from "@coremedia/service-agent";
import { createRichtextConfigurationServiceDescriptor } from "@coremedia/ckeditor5-coremedia-studio-integration/content/RichtextConfigurationServiceDescriptor";
import { Model } from "@ckeditor/ckeditor5-engine";

const logger = LoggerProvider.getLogger("ContentMarkers");

/**
 * Inserts a marker for each given uri.
 *
 * A marker indicates the position of an input item, which can then be
 * displayed in the editing view, but will not be written into the data view.
 * This function also stores data for the input item (ContentInputData) to
 * the ContentInputDataCache.
 *
 * To resolve the identifiers for the created markers use ContentClipboardMarkerDataUtils.toMarkerName.
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

  // Use the current timestamp as the insertionId to mark multiple Contents as part of one insertion.
  // Multiple insertions might happen at the same time and maybe even at the same position (e.g. for slower loading contents).
  // By adding a timestamp for each insertion, those situations can be handled.
  const insertionId = Date.now();
  const multipleInputItems = contentUris.length > 1;
  const insertionContext: InsertionContext = {
    insertionId,
    batch,
    selectedAttributes: attributes,
  };
  //If a range is not collapsed it means that the new content must replace the selected part.
  //Therefore, we remove the targetRange and create a collapsed range at the start of the
  //replaced range.
  const collapsedInsertRange = handleExpandedRange(model, targetRange);

  // Add a content marker for each item.
  contentUris.forEach((contentUri: string, index: number): void => {
    serviceAgent
      .fetchService(createRichtextConfigurationServiceDescriptor())
      .then(async (value) => {
        const embeddableType = await value.isEmbeddableType(contentUri);
        const contentInputData = createContentInputData(
          insertionContext,
          contentUri,
          !embeddableType && !multipleInputItems,
          index
        );
        addContentInputMarker(editor, collapsedInsertRange, contentInputData);
        return embeddableType;
      })
      .catch((reason) => {
        logger.warn("Error while fetching content type", reason);
      });
  });
};

/**
 * Handles expanded ranges by removing everything inside the range and create a
 * collapsed range at the start of the expanded range.
 * If the given range is already collapsed the range will be returned without any changes.
 *
 * @param model - the model to modify if expanded range is given.
 * @param range - the range to
 * @returns ModelRange a collapsed range.
 */
const handleExpandedRange = (model: Model, range: ModelRange): ModelRange => {
  if (range.isCollapsed) {
    return range;
  }
  model.enqueueChange({ isUndoable: false }, (writer: Writer) => {
    writer.remove(range);
  });
  return model.createRange(range.start);
};
/**
 * Creates a ContentInputData object.
 *
 * @param insertionContext - insertionContext
 * @param contentUri - the content-URI of the input item
 * @param isInline - determines whether the item will be displayed inline or
 * as new paragraph
 * @param itemIndex - the position of the item inside the insertion
 * @returns ContentInputData
 */
const createContentInputData = (
  insertionContext: InsertionContext,
  contentUri: string,
  isInline: boolean,
  itemIndex: number
): ContentInputData => ({
  insertionContext,
  itemContext: {
    contentUri,
    itemIndex,
    isInline,
  },
});

/**
 * Adds a marker to the editors model at the given range.
 *
 * A marker itself is inserted without the option to use undo to revert it.
 *
 * @param editor - the editor
 * @param markerRange - the marker range
 * @param contentInputData - content input data
 */
const addContentInputMarker = (editor: Editor, markerRange: ModelRange, contentInputData: ContentInputData): void => {
  const markerName: string = ContentClipboardMarkerDataUtils.toMarkerName(
    contentInputData.insertionContext.insertionId,
    contentInputData.itemContext.itemIndex
  );
  logger.debug("Adding content-input marker", markerName, contentInputData);
  editor.model.enqueueChange({ isUndoable: false }, (writer: Writer) => {
    writer.addMarker(markerName, { usingOperation: true, range: markerRange });
    ContentInputDataCache.storeData(markerName, contentInputData);
  });
};
