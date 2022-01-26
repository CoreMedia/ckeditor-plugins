import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import { ContentClipboardMarkerDataUtils, MarkerData } from "./ContentClipboardMarkerDataUtils";
import ContentDropDataCache, { ContentDropData } from "./ContentDropDataCache";
import { serviceAgent } from "@coremedia/service-agent";
import ContentDisplayService from "@coremedia/ckeditor5-coremedia-studio-integration/content/ContentDisplayService";
import ContentDisplayServiceDescriptor from "@coremedia/ckeditor5-coremedia-studio-integration/content/ContentDisplayServiceDescriptor";
import Writer from "@ckeditor/ckeditor5-engine/src/model/writer";
import Node from "@ckeditor/ckeditor5-engine/src/model/node";
import { ROOT_NAME } from "@coremedia/ckeditor5-coremedia-studio-integration/content/Constants";
import { requireContentCkeModelUri } from "@coremedia/ckeditor5-coremedia-studio-integration/content/UriPath";
import CommandUtils from "./CommandUtils";
import Position from "@ckeditor/ckeditor5-engine/src/model/position";
import Range from "@ckeditor/ckeditor5-engine/src/model/range";
import Logger from "@coremedia/ckeditor5-logging/logging/Logger";
import LoggerProvider from "@coremedia/ckeditor5-logging/logging/LoggerProvider";
import MarkerRepositionUtil from "./MarkerRepositionUtil";
import RichtextConfigurationService from "@coremedia/ckeditor5-coremedia-studio-integration/content/RichtextConfigurationService";
import RichtextConfigurationServiceDescriptor from "@coremedia/ckeditor5-coremedia-studio-integration/content/RichtextConfigurationServiceDescriptor";

type CreateItemFunction = (writer: Writer) => Node;

export default class InputContentResolver {
  static #LOGGER: Logger = LoggerProvider.getLogger("InputContentResolver");

  static triggerLoadAndWriteToModel(editor: Editor, markerData: MarkerData): void {
    const markerName: string = ContentClipboardMarkerDataUtils.toMarkerName(markerData.dropId, markerData.itemIndex);
    const contentDropData = ContentDropDataCache.lookupData(markerName);
    if (!contentDropData) {
      return;
    }
    InputContentResolver.#LOGGER.debug(
      `Looking for replace marker (${markerName}) with content ${contentDropData.itemContext.contentUri}`
    );

    //Fetch Object Type (e.g. document, image, video) Maybe this should be a string which is not related to content type.
    //I guess it has to be something that is unrelated to content type to make it possible for customers to map there own content types.
    //As soon as we do it like this it is a breaking change as customers with own doc type models have to provide the mapping.
    //We could implement a legacy mode where we assume embedded contents are images. The only two attributes to distinguish contents are linkable and embeddable.
    //Lookup an extender with the object type, call the create model stuff.
    //take a promise and execute writeItemToModel
    this.getType(contentDropData.itemContext.contentUri)
      .then((type): Promise<CreateItemFunction> => {
        return this.lookupCreateItemFunction(contentDropData.itemContext.contentUri, type);
      })
      .then((value: CreateItemFunction): void => {
        InputContentResolver.#writeItemToModel(editor, contentDropData, markerData, value);
      })
      .finally(() => InputContentResolver.#reenableUndo(editor));
  }

  static lookupCreateItemFunction(contentUri: string, type: string): Promise<CreateItemFunction> {
    let resolveFunction: (value: CreateItemFunction) => void;
    const returnPromise = new Promise<CreateItemFunction>((resolve) => {
      resolveFunction = resolve;
    });

    // This would be a lookup in an extension point registry and the service agent call would be implemented
    // in the extender
    if (type === "link" || type === "image") {
      serviceAgent
        .fetchService<ContentDisplayService>(new ContentDisplayServiceDescriptor())
        .then((contentDisplayService: ContentDisplayService): void => {
          contentDisplayService.name(contentUri).then((name: string): void => {
            resolveFunction((writer: Writer): Node => {
              const nameToPass = name ? name : ROOT_NAME;
              return InputContentResolver.#createLink(writer, contentUri, nameToPass);
            });
          });
        });
    }

    return returnPromise;
  }

  static getType(contentUri: string): Promise<string> {
    let resolveFunction: (value: string) => void;
    const returnPromise = new Promise<string>((resolve) => {
      resolveFunction = resolve;
    });
    // This would probably be replaced with another service agent call which asks studio for the type.
    // There we can implement a legacy service which works like below and a new one which can be more fine grained.
    // Do we need embeddable/linkable still at this point if we ask studio for more data?
    // This point is not extendable here but in studio. If the studio response delivers another type then link or image
    // it would be possible to provide another model rendering.
    const isEmbeddablePromise = serviceAgent
      .fetchService<RichtextConfigurationService>(new RichtextConfigurationServiceDescriptor())
      .then((value) => value.isEmbeddableType(contentUri));
    const isLinkablePromise = serviceAgent
      .fetchService<RichtextConfigurationService>(new RichtextConfigurationServiceDescriptor())
      .then((value) => value.hasLinkableType(contentUri));
    const promise = Promise.all([isEmbeddablePromise, isLinkablePromise]);
    promise.then((values) => {
      if (values[0]) {
        resolveFunction("image");
        return;
      }
      if (values[1]) {
        resolveFunction("link");
        return;
      }
    });

    return returnPromise;
  }

  static #createLink(writer: Writer, contentUri: string, name: string): Node {
    return writer.createText(name, {
      linkHref: requireContentCkeModelUri(contentUri),
    });
  }

  static #reenableUndo(editor: Editor): void {
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
      InputContentResolver.#applyAttributes(writer, [range], contentDropData.dropContext.selectedAttributes);

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
      const marker = writer.model.markers.get(ContentClipboardMarkerDataUtils.toMarkerNameFromData(markerData));
      if (!marker) {
        return;
      }
      writer.removeMarker(marker);
      ContentDropDataCache.removeData(marker.name);
      writer.removeSelectionAttribute("linkHref");
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
