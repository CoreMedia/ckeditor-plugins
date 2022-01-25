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
import MarkerUtils from "./MarkerUtils";

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

    serviceAgent
      .fetchService<ContentDisplayService>(new ContentDisplayServiceDescriptor())
      .then((contentDisplayService: ContentDisplayService): void => {
        contentDisplayService
          .name(contentDropData.itemContext.contentUri)
          .then(
            (name) => {
              InputContentResolver.#writeItemToModel(
                editor,
                contentDropData,
                markerData,
                (writer: Writer): Node =>
                  InputContentResolver.#createLink(
                    writer,
                    contentDropData.itemContext.contentUri,
                    name ? name : ROOT_NAME
                  )
              );
            },
            (reason) => {
              InputContentResolver.#LOGGER.warn(
                "An error occurred on request to ContentDisplayService.name()",
                contentDropData.itemContext.contentUri,
                reason
              );
              ContentDropDataCache.removeData(markerName);
              editor.model.enqueueChange("transparent", (writer: Writer): void => {
                writer.removeMarker(markerName);
              });
            }
          )
          .finally(() => InputContentResolver.#reenableUndo(editor));
      });
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
      InputContentResolver.#setSelectionAttributes(writer, [range], contentDropData.dropContext.selectedAttributes);

      //Evaluate if a the container element has to be split after the element has been inserted.
      //Split is necessary if the link is not rendered inline and if we are not at the end of a container/document.
      //This prevents empty paragraphs after the inserted element.
      let finalAfterInsertPosition: Position = range.end;
      if (!range.end.isAtEnd && !contentDropData.itemContext.isInline) {
        finalAfterInsertPosition = writer.split(range.end).range.end;
      }
      MarkerUtils.repositionMarkers(editor, markerData, markerPosition, finalAfterInsertPosition);
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
}
