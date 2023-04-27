import { Editor } from "@ckeditor/ckeditor5-core";
import { ContentClipboardMarkerDataUtils, MarkerData } from "./ContentClipboardMarkerDataUtils";
import ContentInputDataCache, { ContentInputData } from "./ContentInputDataCache";
import { serviceAgent } from "@coremedia/service-agent";
import { Writer, Node, Position, Range } from "@ckeditor/ckeditor5-engine";
import Logger from "@coremedia/ckeditor5-logging/src/logging/Logger";
import LoggerProvider from "@coremedia/ckeditor5-logging/src/logging/LoggerProvider";
import MarkerRepositionUtil from "./MarkerRepositionUtil";
import { createRichtextConfigurationServiceDescriptor } from "@coremedia/ckeditor5-coremedia-studio-integration/src/content/RichtextConfigurationServiceDescriptor";
import ContentToModelRegistry, { CreateModelFunction } from "./ContentToModelRegistry";
import { enableUndo, UndoSupport } from "./integrations/Undo";
import {
  ContentReferenceResponse,
  createContentReferenceServiceDescriptor,
} from "@coremedia/ckeditor5-coremedia-studio-integration/src/content/studioservices/IContentReferenceService";
import { createContentImportServiceDescriptor } from "@coremedia/ckeditor5-coremedia-studio-integration/src/content/studioservices/ContentImportService";
import { getOptionalPlugin } from "@coremedia/ckeditor5-core-common/src/Plugins";

const UTILITY_NAME = "DataToModelMechanism";

/**
 * The DataToModelMechanism is a utility class that handles content insertions
 * into the editor and adjusts the editor's model accordingly. To be precise, it
 * actually receives information about a previously added marker, fetches the
 * required data and displays it at the marker position.
 *
 * **How this works with other ContentClipboard Plugins:**
 *
 * The {@link ContentClipboard} plugin integrates into the CKEditor's Input
 * Pipeline and evaluates input events for CoreMedia Content inputs. Whenever an
 * input is received, a placeholder marker gets inserted at the corresponding
 * cursor position.
 *
 * Markers are used to indicate or highlight different things in the editor's
 * view, and in this case, are used to display a loading animation since the
 * actual contents might take a while to load. The
 * {@link ContentClipboardEditing} plugin listens to markers getting added and
 * triggers the {@link DataToModelMechanism} if needed.
 *
 * **DataToModelMechanism in Detail:**
 *
 * The DataToModelMechanism is executed whenever a marker is added and receives
 * the corresponding MarkerData object. The MarkerData holds information about
 * the input data, such as the contentUri or the size of the insertion.
 *
 * Now, the DataToModelMechanism uses a Studio service to resolve the type of
 * the content object from the given contentUri. The type is needed to figure
 * out how to render the content in the editor, or more precise, how the model
 * the content type is defined. This information is provided by the
 * {@link ContentToModelRegistry}, which allows other plugins to register model
 * creator strategies for different content types.
 *
 * Now, the model then is written, the view updates accordingly and the marker
 * (loading animation) gets removed.
 */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default class DataToModelMechanism {
  static readonly #logger: Logger = LoggerProvider.getLogger(UTILITY_NAME);

  /**
   * This method is called when a marker is added to the editor.
   * It receives a markerData object and fetches the data to render the content.
   * It then renders the content in the editor and finally removes the marker.
   *
   * @param editor - the editor
   * @param pendingMarkerNames - all markers that are not yet finally inserted.
   * @param markerData - object that holds information about the marker and the associated content insertion
   */
  static triggerLoadAndWriteToModel(editor: Editor, pendingMarkerNames: string[], markerData: MarkerData): void {
    const logger = DataToModelMechanism.#logger;

    const markerName: string = ContentClipboardMarkerDataUtils.toMarkerName(
      markerData.insertionId,
      markerData.itemIndex
    );
    const contentInputData = ContentInputDataCache.lookupData(markerName);
    if (!contentInputData) {
      return;
    }
    logger.debug(`Looking for replace marker (${markerName}) with content ${contentInputData.itemContext.uri}`);

    // Fetch Object Type (e.g. document, image, video) Maybe this should be a
    // string, which is unrelated to the content type. I guess it has to be
    // something that is unrelated to the content type to make it possible
    // to map custom content types. As soon as we do it like this,
    // it is a breaking change as implementors with own doc type models have to
    // provide the mapping.
    //
    // We could implement a legacy mode where we assume embedded contents are
    // images. The only two attributes to distinguish contents are linkable and
    // embeddable. Lookup an extender with the object type, call the `create`
    // model stuff. Take a promise and execute writeItemToModel.
    const uri = contentInputData.itemContext.uri;
    serviceAgent
      .fetchService(createContentReferenceServiceDescriptor())
      .then((service) => service.getContentReference(uri))
      .then(async (response: ContentReferenceResponse) => {
        if (response.contentUri) {
          //The reference uri is a content uri
          return Promise.resolve(response.contentUri);
        }
        if (!response.externalUriInformation) {
          return Promise.reject("No content found and uri is not importable.");
        }

        const contentImportService = await serviceAgent.fetchService(createContentImportServiceDescriptor());
        if (response.externalUriInformation.contentUri) {
          //The external content has been imported previously. A content representation already exists.
          return Promise.resolve(response.externalUriInformation.contentUri);
        }

        //Neither a content nor a content representation found. Let's create a content representation.
        const importedContentReference = await contentImportService.import(response.request);
        return Promise.resolve(importedContentReference);
      })
      .then(async (uri: string) => {
        const type = await this.#getType(uri);
        const createItemFunction = await this.lookupCreateItemFunction(type, uri);
        return DataToModelMechanism.#writeItemToModel(
          editor,
          pendingMarkerNames,
          contentInputData,
          markerData,
          createItemFunction
        );
      })
      .catch((reason) => {
        DataToModelMechanism.#markerCleanup(editor, pendingMarkerNames, markerData);
        logger.error("Error occurred in promise", reason);
      })
      .finally(() => DataToModelMechanism.#finishInsertion(editor));
  }

  /**
   * Uses the {@link ContentToModelRegistry} to look up a strategy to create a model element
   * for the given contentUri.
   *
   * @param type - the type of the inserted content object
   * @param contentUri - the contentUri of the content object
   * @returns a Promise containing the function that creates the model element
   */
  static lookupCreateItemFunction(type: string, contentUri: string): Promise<CreateModelFunction> {
    const toModelFunction = ContentToModelRegistry.getToModelFunction(type, contentUri);
    if (toModelFunction) {
      return toModelFunction;
    }

    // In case no "toModel" function for the given type is provided, the lookup will
    // try to render the contentUri as a link to the referenced content.
    // This should work if the ContentLinks plugin is enabled.
    // If this is not the case and no matching function is registered, an error will be thrown.
    const fallbackFunction = ContentToModelRegistry.getToModelFunction("link", contentUri);
    if (fallbackFunction) {
      return fallbackFunction;
    }

    return Promise.reject(new Error(`No function to create the model found for type: ${type}`));
  }

  /**
   * Uses the {@link RichtextConfigurationService} to asynchronously fetch the
   * content type of given contentUri.
   *
   * @param contentUri - the contentUri
   * @returns a Promise containing the type of the content
   */
  static #getType(contentUri: string): Promise<string> {
    // This would probably be replaced with another service agent call, which
    // asks Studio for the type.
    //
    // There we can implement a legacy service, which works like below and a
    // new one, which can be more fine-grained.
    //
    // Do we need embeddable/linkable still at this point if we ask Studio for
    // more data? This point is not extendable here but in CoreMedia Studio.
    // If the studio response delivers another type, then link or image,
    // it would be possible to provide another model rendering.
    return serviceAgent
      .fetchService(createRichtextConfigurationServiceDescriptor())
      .then((service) => service.isEmbeddableType(contentUri))
      .then((isEmbeddable) => (isEmbeddable ? "image" : "link"));
  }

  /**
   * Verifies if this was the last marker of the content insertion.
   * If this is the case, the disabled undo action gets enabled again.
   * This is important because the undo action is disabled at the start of an insertion.
   *
   * @param editor - the editor
   */
  static #finishInsertion(editor: Editor): void {
    const markers = Array.from(
      editor.model.markers.getMarkersGroup(ContentClipboardMarkerDataUtils.CONTENT_INPUT_MARKER_PREFIX)
    );
    if (markers.length === 0) {
      const undoSupport = getOptionalPlugin(editor, UndoSupport, (pluginName) =>
        this.#logger.warn(`Unable to re-enable UndoCommand because plugin ${pluginName} does not exist`)
      );
      if (undoSupport) {
        enableUndo(undoSupport);
      }
    }
  }

  /**
   * Calculates the location of the marker and inserts the content via the provided
   * createItemFunction at that position.
   * Please note: This method might split the parent container.
   *
   * @param editor - the editor
   * @param pendingMarkerNames - all markers that are not yet finally inserted.
   * @param contentInputData - the contentInputData object
   * @param markerData - the markerData object
   * @param createItemFunction - the function to create the model element
   */
  static #writeItemToModel(
    editor: Editor,
    pendingMarkerNames: string[],
    contentInputData: ContentInputData,
    markerData: MarkerData,
    createItemFunction: (writer: Writer) => Node
  ): void {
    editor.model.enqueueChange(contentInputData.insertionContext.batch, (writer: Writer): void => {
      const item: Node = createItemFunction(writer);
      const marker = writer.model.markers.get(ContentClipboardMarkerDataUtils.toMarkerNameFromData(markerData));
      if (!marker) {
        return;
      }
      const markerPosition: Position | undefined = marker.getStart();
      if (!markerPosition) {
        ContentInputDataCache.removeData(marker.name);
        return;
      }

      let insertPosition = markerPosition;
      if (!markerPosition.isAtStart && !contentInputData.itemContext.isInline) {
        insertPosition = writer.split(markerPosition).range.end;
      }

      const range = writer.model.insertContent(item, insertPosition);
      DataToModelMechanism.#applyAttributes(writer, [range], contentInputData.insertionContext.selectedAttributes);

      // Evaluate if the container element has to be split after the element has
      // been inserted.
      //
      // Split is necessary if the link is not rendered inline, and if we are not
      // at the end of a container/document. This prevents empty paragraphs
      // after the inserted element.
      let finalAfterInsertPosition: Position = range.end;
      if (!range.end.isAtEnd && !contentInputData.itemContext.isInline) {
        finalAfterInsertPosition = writer.split(range.end).range.end;
      }
      MarkerRepositionUtil.repositionMarkers(editor, markerData, markerPosition, finalAfterInsertPosition);
    });

    editor.model.enqueueChange({ isUndoable: false }, (writer: Writer): void => {
      writer.removeSelectionAttribute("linkHref");
    });
    DataToModelMechanism.#markerCleanup(editor, pendingMarkerNames, markerData);
  }

  /**
   * Removes the marker in the editor view. Also removes the corresponding data from
   * the {@link ContentInputDataCache}.
   *
   * @param editor - the editor
   * @param pendingMarkerNames - all markers that are not yet finally inserted.
   * @param markerData - the markerData object
   */
  static #markerCleanup(editor: Editor, pendingMarkerNames: string[], markerData: MarkerData): void {
    editor.model.enqueueChange({ isUndoable: false }, (writer: Writer): void => {
      const marker = writer.model.markers.get(ContentClipboardMarkerDataUtils.toMarkerNameFromData(markerData));
      if (!marker) {
        return;
      }
      writer.removeMarker(marker);
      const actualIndex = pendingMarkerNames.indexOf(marker.name);
      if (actualIndex >= 0) {
        pendingMarkerNames.splice(actualIndex, 1);
      }

      ContentInputDataCache.removeData(marker.name);
    });
  }

  /**
   * Applies attributes to the given ranges.
   *
   * @param writer - writer to use
   * @param textRanges - ranges to apply attributes to
   * @param attributes - attributes to apply
   */
  static #applyAttributes(writer: Writer, textRanges: Range[], attributes: [string, unknown][]): void {
    for (const attribute of attributes) {
      for (const range of textRanges) {
        writer.setAttribute(attribute[0], attribute[1], range);
      }
    }
  }
}
