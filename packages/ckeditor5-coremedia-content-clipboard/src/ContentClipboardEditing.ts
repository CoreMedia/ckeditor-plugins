import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import Logger from "@coremedia/ckeditor5-logging/logging/Logger";
import LoggerProvider from "@coremedia/ckeditor5-logging/logging/LoggerProvider";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import "../theme/loadmask.css";

import DowncastDispatcher from "@ckeditor/ckeditor5-engine/src/conversion/downcastdispatcher";
import Position from "@ckeditor/ckeditor5-engine/src/model/position";
import ContentDropDataCache, { ContentDropData } from "./ContentDropDataCache";
import Writer from "@ckeditor/ckeditor5-engine/src/model/writer";
import ContentDisplayService from "@coremedia/ckeditor5-coremedia-studio-integration/content/ContentDisplayService";
import ContentDisplayServiceDescriptor
  from "@coremedia/ckeditor5-coremedia-studio-integration/content/ContentDisplayServiceDescriptor";
import { serviceAgent } from "@coremedia/service-agent";
import EventInfo from "@ckeditor/ckeditor5-utils/src/eventinfo";
import { Marker } from "@ckeditor/ckeditor5-engine/src/model/markercollection";
import { ContentClipboardMarkerUtils, MarkerData } from "./ContentClipboardMarkerUtils";
import { ROOT_NAME } from "@coremedia/ckeditor5-coremedia-studio-integration/content/Constants";
import CommandUtils from "./CommandUtils";
import Range from "@ckeditor/ckeditor5-engine/src/model/range";
import { requireContentCkeModelUri } from "@coremedia/ckeditor5-coremedia-studio-integration/content/UriPath";
import { SelectionRangeChangeEventData } from "@ckeditor/ckeditor5-engine/src/model/documentselection";
import { addContentMarkerConversion, removeContentMarkerConversion } from "./converters";

export default class ContentClipboardEditing extends Plugin {
  static #CONTENT_CLIPBOARD_EDITING_PLUGIN_NAME = "ContentClipboardEditing";
  static #LOGGER: Logger = LoggerProvider.getLogger(ContentClipboardEditing.#CONTENT_CLIPBOARD_EDITING_PLUGIN_NAME);
  static readonly #CONTENT_DROP_ADD_MARKER_EVENT = "addMarker:" + ContentClipboardMarkerUtils.CONTENT_DROP_MARKER_PREFIX;
  static readonly #CONTENT_DROP_REMOVE_MARKER_EVENT = "removeMarker:" + ContentClipboardMarkerUtils.CONTENT_DROP_MARKER_PREFIX;
  static get pluginName(): string {
    return ContentClipboardEditing.#CONTENT_CLIPBOARD_EDITING_PLUGIN_NAME;
  }

  static get requires(): Array<new (editor: Editor) => Plugin> {
    return [];
  }

  init(): Promise<void> | null {
    this.#defineConverters();
    return null;
  }

  #defineConverters(): void {
    const editor = this.editor;
    const conversion = editor.conversion;

    conversion.for("editingDowncast").add( (dispatcher: DowncastDispatcher) => {
      dispatcher.on(ContentClipboardEditing.#CONTENT_DROP_ADD_MARKER_EVENT, addContentMarkerConversion((markerData: MarkerData): void => {
        ContentClipboardEditing.#triggerLoadAndWriteToModel(editor, markerData);
      }));
      dispatcher.on(ContentClipboardEditing.#CONTENT_DROP_REMOVE_MARKER_EVENT, removeContentMarkerConversion);
    });
  }

  static #triggerLoadAndWriteToModel(editor: Editor, markerData: MarkerData): void {
    const markerName: string = ContentClipboardMarkerUtils.toMarkerName(markerData.dropId, markerData.itemIndex);
    const contentDropData = ContentDropDataCache.lookupData(markerName);
    if (!contentDropData) {
      return;
    }
    ContentClipboardEditing.#LOGGER.debug(
      `Looking for replace marker (${markerName}) with content ${contentDropData.itemContext.contentUri}`
    );

    serviceAgent
      .fetchService<ContentDisplayService>(new ContentDisplayServiceDescriptor())
      .then((contentDisplayService: ContentDisplayService): void => {
        contentDisplayService.name(contentDropData.itemContext.contentUri).then(name => {
            ContentClipboardEditing.#writeLinkToModel(editor, contentDropData, markerData, name ? name: ROOT_NAME);
            ContentClipboardEditing.#reenableUndo(editor);
          }, (reason) => {
            ContentClipboardEditing.#LOGGER.warn("An error occurred on request to ContentDisplayService.name()", contentDropData.itemContext.contentUri, reason);
            ContentDropDataCache.removeData(markerName);
            editor.model.enqueueChange("transparent", (writer: Writer): void  => {
              writer.removeMarker(markerName);
            });
            ContentClipboardEditing.#reenableUndo(editor);
          }
        );
      });
  }

  static #reenableUndo(editor: Editor): void {
    const markers = Array.from(editor.model.markers.getMarkersGroup(ContentClipboardMarkerUtils.CONTENT_DROP_MARKER_PREFIX));
    if (markers.length === 0) {
      CommandUtils.enableCommand(editor, "undo");
    }
  }

  static #writeLinkToModel(editor: Editor, contentDropData: ContentDropData, markerData: MarkerData, name: string): void {
    const isInline = !contentDropData.itemContext.isEmbeddableContent && !contentDropData.dropContext.multipleItemsDropped;

    editor.model.enqueueChange(contentDropData.dropContext.batch, (writer: Writer): void => {
      const contentUri: string = contentDropData.itemContext.contentUri;
      const link = writer.createText(name, {
        linkHref: requireContentCkeModelUri(contentUri),
      });

      const marker = writer.model.markers.get(ContentClipboardMarkerUtils.toMarkerNameFromData(markerData));
      if (!marker) {
        return;
      }
      const markerPosition: Position | undefined = marker.getStart();
      if (!markerPosition) {
        ContentDropDataCache.removeData(marker.name);
        return;
      }

      const isFirstDroppedItem = markerData.itemIndex === 0;
      const insertPosition = !isFirstDroppedItem || isInline || markerPosition.isAtStart ? markerPosition : writer.split(markerPosition).range.end;
      const gravityRestore = writer.overrideSelectionGravity();
      writer.model.document.selection.on("change:range", (evtInfo: EventInfo, directChange: SelectionRangeChangeEventData) => {
        if (directChange.directChange) {
          writer.restoreSelectionGravity(gravityRestore);
          evtInfo.off();
        }
      });
      writer.insert(link, insertPosition);
      const positionAfterInsertedElement = writer.createPositionAt(link, "after");
      const positionBeforeInsertedElement = writer.createPositionAt(link, "before");
      const range = writer.createRange(positionBeforeInsertedElement, positionAfterInsertedElement);
      ContentClipboardEditing.#setSelectionAttributes(writer, [range], contentDropData.dropContext.selectedAttributes);
      //evaluate if a the container element has to be split after the element has been inserted.
      //Split is necesarry if the link is not rendered inline and if we are not at the end of a container/document.
      //This prevents empty paragraphs after the inserted element.
      const finalAfterInsertPosition = isInline || positionAfterInsertedElement.isAtEnd ? positionAfterInsertedElement: writer.split(positionAfterInsertedElement).range.end;
      ContentClipboardEditing.#moveMarkerForNextItemsToTheRight(editor, finalAfterInsertPosition, marker, markerData);
      ContentClipboardEditing.#moveMarkerForPreviousItemsToLeft(editor, markerPosition, marker, markerData);
    });

    editor.model.enqueueChange("transparent", (writer: Writer): void => {
      const marker = writer.model.markers.get(ContentClipboardMarkerUtils.toMarkerNameFromData(markerData));
      if (!marker) {
        return;
      }
      writer.removeMarker(marker);
      ContentDropDataCache.removeData(marker.name);
    });
  }

  static #moveMarkerForPreviousItemsToLeft(editor: Editor, start: Position, marker: Marker, markerData: MarkerData) {
    const markers: Array<Marker> = ContentClipboardEditing.#findMarkersBefore(editor, marker, markerData);
    markers.forEach((markerToMoveToLeft: Marker) => {

      //Each Marker has its own batch so everything is executed in one step and in the end everything is one undo/redo step.
      const currentData = ContentDropDataCache.lookupData(markerToMoveToLeft.name);
      if (!currentData) {
        return;
      }
      editor.model.enqueueChange("transparent", (writer: Writer): void => {
          const newRange = writer.createRange(start, start);
          writer.updateMarker(markerToMoveToLeft, {range: newRange})
      });
    })
  }

  static #moveMarkerForNextItemsToTheRight(editor: Editor, start: Position, marker: Marker, markerData: MarkerData) {
    const markers: Array<Marker> = ContentClipboardEditing.#findMarkersAfter(editor, marker, markerData);
    markers.forEach((markerToMoveToLeft: Marker) => {

      //Each Marker has its own batch so everything is executed in one step and in the end everything is one undo/redo step.
      const currentData = ContentDropDataCache.lookupData(markerToMoveToLeft.name);
      if (!currentData) {
        return;
      }
      editor.model.enqueueChange("transparent", (writer: Writer): void => {
          const newRange = writer.createRange(start, start);
          writer.updateMarker(markerToMoveToLeft, {range: newRange})
      });
    })
  }

  static #findMarkersBefore(editor: Editor, marker: Marker, markerData: MarkerData): Array<Marker> {
    const markersAtSamePosition = ContentClipboardEditing.#markersAtPosition(editor, marker.getStart());
    const itemIndex = markerData.itemIndex;
    const dropId = markerData.dropId;

    return markersAtSamePosition.filter((otherMarker: Marker) => {
      const otherMarkerData = ContentClipboardMarkerUtils.splitMarkerName(otherMarker.name);
      //dropId = Timestamp when a group of marker have been created.
      //If we are in the same group of markers (part of one drop) we want to adapt all markers with a
      //smaller index.
      if (otherMarkerData.dropId === dropId) {
        return otherMarkerData.itemIndex < itemIndex;
      }

      //If a drop done later to the same position happened we want to make sure all the dropped
      //items stay on the left of the marker.
      return otherMarkerData.dropId > dropId
    });
  }

  static #markersAtPosition(editor: Editor, position: Position): Array<Marker> {
    return Array.from(editor.model.markers.getMarkersGroup(ContentClipboardMarkerUtils.CONTENT_DROP_MARKER_PREFIX)).filter(value => {
      return value.getStart().isEqual(position);
    });
  }

  static #findMarkersAfter(editor: Editor, marker: Marker, markerData: MarkerData) {
    const markersAtSamePosition = ContentClipboardEditing.#markersAtPosition(editor, marker.getStart());
    const itemIndex = markerData.itemIndex;
    const dropId = markerData.dropId;

    return markersAtSamePosition.filter((otherMarker: Marker) => {
      const otherMarkerData = ContentClipboardMarkerUtils.splitMarkerName(otherMarker.name);
      //dropId = Timestamp when a group of marker have been created.
      //If we are in the same group of markers (part of one drop) we want to adapt all markers with a
      //bigger index.
      if (otherMarkerData.dropId === dropId) {
        return otherMarkerData.itemIndex > itemIndex;
      }

      //If a drop done later to the same position happened we want to make sure all the dropped
      //items stay on the right of the marker.
      return otherMarkerData.dropId < dropId
    });
  }
  /**
   * Applies selection attributes to the given ranges.
   *
   * @param writer writer to use
   * @param textRanges ranges to apply selection attributes to
   * @param attributes selection attributes to apply
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
