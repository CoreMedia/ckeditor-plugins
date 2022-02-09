import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import { ContentClipboardMarkerDataUtils, MarkerData } from "./ContentClipboardMarkerDataUtils";
import ContentDropDataCache, { ContentDropData } from "./ContentDropDataCache";
import { serviceAgent } from "@coremedia/service-agent";
import Writer from "@ckeditor/ckeditor5-engine/src/model/writer";
import Node from "@ckeditor/ckeditor5-engine/src/model/node";
import CommandUtils from "./CommandUtils";
import Position from "@ckeditor/ckeditor5-engine/src/model/position";
import Range from "@ckeditor/ckeditor5-engine/src/model/range";
import Logger from "@coremedia/ckeditor5-logging/logging/Logger";
import LoggerProvider from "@coremedia/ckeditor5-logging/logging/LoggerProvider";
import MarkerRepositionUtil from "./MarkerRepositionUtil";
import RichtextConfigurationService
  from "@coremedia/ckeditor5-coremedia-studio-integration/content/RichtextConfigurationService";
import RichtextConfigurationServiceDescriptor
  from "@coremedia/ckeditor5-coremedia-studio-integration/content/RichtextConfigurationServiceDescriptor";
import ContentToModelRegistry, { CreateModelFunction } from "./ContentToModelRegistry";

export default class DataToModelMechanism {
  static #LOGGER: Logger = LoggerProvider.getLogger("DataToModelMechanism");

  static triggerLoadAndWriteToModel(editor: Editor, markerData: MarkerData): void {
    const markerName: string = ContentClipboardMarkerDataUtils.toMarkerName(markerData.dropId, markerData.itemIndex);
    const contentDropData = ContentDropDataCache.lookupData(markerName);
    if (!contentDropData) {
      return;
    }
    DataToModelMechanism.#LOGGER.debug(
      `Looking for replace marker (${markerName}) with content ${contentDropData.itemContext.contentUri}`
    );

    //Fetch Object Type (e.g. document, image, video) Maybe this should be a string which is not related to content type.
    //I guess it has to be something that is unrelated to content type to make it possible for customers to map there own content types.
    //As soon as we do it like this it is a breaking change as customers with own doc type models have to provide the mapping.
    //We could implement a legacy mode where we assume embedded contents are images. The only two attributes to distinguish contents are linkable and embeddable.
    //Lookup an extender with the object type, call the create model stuff.
    //take a promise and execute writeItemToModel
    this.#getType(contentDropData.itemContext.contentUri)
      .then((type): Promise<CreateModelFunction> => {
        return this.lookupCreateItemFunction(type, contentDropData.itemContext.contentUri);
      })
      .then((createItemFunction: CreateModelFunction): void => {
        DataToModelMechanism.#writeItemToModel(editor, contentDropData, markerData, createItemFunction);
      })
      .catch((reason) => {
        DataToModelMechanism.#markerCleanup(editor, markerData);
        DataToModelMechanism.#LOGGER.error("Error occurred in promise", reason);
      })
      .finally(() => DataToModelMechanism.#finishDrop(editor));
  }

  static lookupCreateItemFunction(type: string, contentUri: string): Promise<CreateModelFunction> {
    const toModelFunction = ContentToModelRegistry.getToModelFunction(type, contentUri);
    if (toModelFunction) {
      return toModelFunction;
    }

    return new Promise<CreateModelFunction>((resolve, reject) => {
      reject("No function to create the model found.");
    });
  }

  static #getType(contentUri: string): Promise<string> {
    // This would probably be replaced with another service agent call which asks studio for the type.
    // There we can implement a legacy service which works like below and a new one which can be more fine grained.
    // Do we need embeddable/linkable still at this point if we ask studio for more data?
    // This point is not extendable here but in studio. If the studio response delivers another type then link or image
    // it would be possible to provide another model rendering.
    return serviceAgent
      .fetchService<RichtextConfigurationService>(new RichtextConfigurationServiceDescriptor())
      .then((service) => service.isEmbeddableType(contentUri))
      .then((isEmbeddable): Promise<string> => {
        if (isEmbeddable) {
          return new Promise<string>((resolve) => {
            resolve("image");
          });
        }
        return new Promise<string>((resolve) => {
          resolve("link");
        });
      });
  }

  static #finishDrop(editor: Editor): void {
    const markers = Array.from(
      editor.model.markers.getMarkersGroup(ContentClipboardMarkerDataUtils.CONTENT_DROP_MARKER_PREFIX)
    );
    if (markers.length === 0) {
      CommandUtils.enableCommand(editor, "undo");
    }
  }

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

      //Evaluate if a the container element has to be split after the element has been inserted.
      //Split is necessary if the link is not rendered inline and if we are not at the end of a container/document.
      //This prevents empty paragraphs after the inserted element.
      let finalAfterInsertPosition: Position = range.end;
      if (!range.end.isAtEnd && !contentDropData.itemContext.isInline) {
        finalAfterInsertPosition = writer.split(range.end).range.end;
      }
      MarkerRepositionUtil.repositionMarkers(editor, markerData, markerPosition, finalAfterInsertPosition);
    });

    editor.model.enqueueChange("transparent", (writer: Writer): void => {
      writer.removeSelectionAttribute("linkHref");
    });
    DataToModelMechanism.#markerCleanup(editor, markerData);
  }

  static #markerCleanup(editor: Editor, markerData: MarkerData) {
    editor.model.enqueueChange("transparent", (writer: Writer): void => {
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
   * @param writer writer to use
   * @param textRanges ranges to apply attributes to
   * @param attributes attributes to apply
   * @private
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