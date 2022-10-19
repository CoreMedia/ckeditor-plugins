import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import { ContentClipboardMarkerDataUtils, MarkerData } from "./ContentClipboardMarkerDataUtils";
import ContentDropDataCache, { ContentDropData } from "./ContentDropDataCache";
import { serviceAgent } from "@coremedia/service-agent";
import Writer from "@ckeditor/ckeditor5-engine/src/model/writer";
import Node from "@ckeditor/ckeditor5-engine/src/model/node";
import Position from "@ckeditor/ckeditor5-engine/src/model/position";
import Range from "@ckeditor/ckeditor5-engine/src/model/range";
import Logger from "@coremedia/ckeditor5-logging/logging/Logger";
import LoggerProvider from "@coremedia/ckeditor5-logging/logging/LoggerProvider";
import MarkerRepositionUtil from "./MarkerRepositionUtil";
import { createRichtextConfigurationServiceDescriptor } from "@coremedia/ckeditor5-coremedia-studio-integration/content/RichtextConfigurationServiceDescriptor";
import ContentToModelRegistry, { CreateModelFunction } from "./ContentToModelRegistry";
import { ifPlugin } from "@coremedia/ckeditor5-core-common/Plugins";
import { enableUndo, UndoSupport } from "./integrations/Undo";

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
 * view and in this case are used to display a loading animation since the
 * actual contents might take a while to load. The
 * {@link ContentClipboardEditing} plugin listens to markers getting added and
 * triggers the {@link DataToModelMechanism} if needed.
 *
 * **DataToModelMechanism in Detail:**
 *
 * The DataToModelMechanism is executed whenever a marker is added and receives
 * the corresponding MarkerData object. The MarkerData holds information about
 * the dropped data, such as the contentUri or the size of the drop.
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
   * @param markerData - object that holds information about the marker and the associated content drop
   */
  static triggerLoadAndWriteToModel(editor: Editor, markerData: MarkerData): void {
    const logger = DataToModelMechanism.#logger;

    const markerName: string = ContentClipboardMarkerDataUtils.toMarkerName(markerData.dropId, markerData.itemIndex);
    const contentDropData = ContentDropDataCache.lookupData(markerName);
    if (!contentDropData) {
      return;
    }
    logger.debug(`Looking for replace marker (${markerName}) with content ${contentDropData.itemContext.contentUri}`);

    // Fetch Object Type (e.g. document, image, video) Maybe this should be a
    // string, which is unrelated to content type. I guess it has to be
    // something that is unrelated to content type to make it possible
    // to map custom content types. As soon as we do it like this
    // it is a breaking change as implementors with own doc type models have to
    // provide the mapping.
    //
    // We could implement a legacy mode where we assume embedded contents are
    // images. The only two attributes to distinguish contents are linkable and
    // embeddable. Lookup an extender with the object type, call the `create`
    // model stuff. take a promise and execute writeItemToModel
    this.#getType(contentDropData.itemContext.contentUri)
      .then(
        (type): Promise<CreateModelFunction> =>
          this.lookupCreateItemFunction(type, contentDropData.itemContext.contentUri)
      )
      .then((createItemFunction: CreateModelFunction): void => {
        DataToModelMechanism.#writeItemToModel(editor, contentDropData, markerData, createItemFunction);
      })
      .catch((reason) => {
        DataToModelMechanism.#markerCleanup(editor, markerData);
        logger.error("Error occurred in promise", reason);
      })
      .finally(() => DataToModelMechanism.#finishDrop(editor));
  }

  /**
   * Uses the {@link ContentToModelRegistry} to lookup a strategy to create a model element
   * for the given contentUri.
   *
   * @param type - the type of the dropped content object
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
   * Uses the {@link RichtextConfigurationService} to asynchronously fetch the content type
   * of a given contentUri.
   *
   * @param contentUri - the contentUri
   * @returns a Promise containing the type of the content
   */
  static #getType(contentUri: string): Promise<string> {
    // This would probably be replaced with another service agent call, which
    // asks studio for the type.
    //
    // There we can implement a legacy service, which works like below and a
    // new one, which can be more fine-grained.
    //
    // Do we need embeddable/linkable still at this point if we ask studio for
    // more data? This point is not extendable here but in CoreMedia Studio.
    // If the studio response delivers another type then link or image
    // it would be possible to provide another model rendering.
    return serviceAgent
      .fetchService(createRichtextConfigurationServiceDescriptor())
      .then((service) => service.isEmbeddableType(contentUri))
      .then((isEmbeddable) => (isEmbeddable ? "image" : "link"));
  }

  /**
   * Verifies if this was the last marker of the content drop.
   * If this is the case, the disabled undo action gets enabled again.
   * This is important because the undo action is disabled at the start of a drop.
   *
   * @param editor - the editor
   */
  static #finishDrop(editor: Editor): void {
    const markers = Array.from(
      editor.model.markers.getMarkersGroup(ContentClipboardMarkerDataUtils.CONTENT_DROP_MARKER_PREFIX)
    );
    if (markers.length === 0) {
      void ifPlugin(editor, UndoSupport).then(enableUndo);
    }
  }

  /**
   * Calculates the location of the marker and inserts the content via the provided
   * createItemFunction at that position.
   * Please note: This method might split the parent container.
   *
   * @param editor - the editor
   * @param contentDropData - the contentDropData object
   * @param markerData - the markerData object
   * @param createItemFunction - the function to create the model element
   */
  static #writeItemToModel(
    editor: Editor,
    contentDropData: ContentDropData,
    markerData: MarkerData,
    createItemFunction: (writer: Writer) => Node
  ): void {
    editor.model.enqueueChange(contentDropData.dropContext.batch, (writer: Writer): void => {
      const item: Node = createItemFunction(writer);
      const marker = writer.model.markers.get(ContentClipboardMarkerDataUtils.toMarkerNameFromData(markerData));
      if (!marker) {
        return;
      }
      const markerPosition: Position | undefined = marker.getStart();
      if (!markerPosition) {
        ContentDropDataCache.removeData(marker.name);
        return;
      }

      let insertPosition = markerPosition;
      if (!markerPosition.isAtStart && !contentDropData.itemContext.isInline) {
        insertPosition = writer.split(markerPosition).range.end;
      }

      const range = writer.model.insertContent(item, insertPosition);
      DataToModelMechanism.#applyAttributes(writer, [range], contentDropData.dropContext.selectedAttributes);

      // Evaluate if the container element has to be split after the element has
      // been inserted.
      //
      // Split is necessary if the link is not rendered inline and if we are not
      // at the end of a container/document. This prevents empty paragraphs
      // after the inserted element.
      let finalAfterInsertPosition: Position = range.end;
      if (!range.end.isAtEnd && !contentDropData.itemContext.isInline) {
        finalAfterInsertPosition = writer.split(range.end).range.end;
      }
      MarkerRepositionUtil.repositionMarkers(editor, markerData, markerPosition, finalAfterInsertPosition);
    });

    editor.model.enqueueChange({ isUndoable: false }, (writer: Writer): void => {
      writer.removeSelectionAttribute("linkHref");
    });
    DataToModelMechanism.#markerCleanup(editor, markerData);
  }

  /**
   * Removes the marker in the editor view. Also removes the corresponding data from
   * the {@link ContentDropDataCache}.
   *
   * @param editor - the editor
   * @param markerData - the markerData object
   */
  static #markerCleanup(editor: Editor, markerData: MarkerData): void {
    editor.model.enqueueChange({ isUndoable: false }, (writer: Writer): void => {
      const marker = writer.model.markers.get(ContentClipboardMarkerDataUtils.toMarkerNameFromData(markerData));
      if (!marker) {
        return;
      }
      writer.removeMarker(marker);
      ContentDropDataCache.removeData(marker.name);
    });
  }

  /**
   * Applies attributes to the given ranges.
   *
   * @param writer - writer to use
   * @param textRanges - ranges to apply attributes to
   * @param attributes - attributes to apply
   */
  static #applyAttributes(
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
}
