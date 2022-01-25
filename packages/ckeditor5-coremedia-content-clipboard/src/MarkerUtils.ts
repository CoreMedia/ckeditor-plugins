import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import { Marker } from "@ckeditor/ckeditor5-engine/src/model/markercollection";
import { ContentClipboardMarkerDataUtils, MarkerData } from "./ContentClipboardMarkerDataUtils";
import ModelPosition from "@ckeditor/ckeditor5-engine/src/model/position";
import Position from "@ckeditor/ckeditor5-engine/src/model/position";
import ContentDropDataCache from "./ContentDropDataCache";
import Writer from "@ckeditor/ckeditor5-engine/src/model/writer";

export default class MarkerUtils {
  static repositionMarkers(
    editor: Editor,
    markerData: MarkerData,
    beforeItemPosition: ModelPosition,
    afterItemPosition: ModelPosition
  ): void {
    MarkerUtils.#moveMarkerForNextItemsToTheRight(editor, afterItemPosition, markerData);
    MarkerUtils.#moveMarkerForPreviousItemsToLeft(editor, beforeItemPosition, markerData);
  }

  static #moveMarkerForPreviousItemsToLeft(editor: Editor, beforeItemPosition: Position, markerData: MarkerData) {
    const markers: Array<Marker> = MarkerUtils.#findMarkersBefore(editor, markerData);
    markers.forEach((markerToMoveToLeft: Marker) => {
      //Each Marker has its own batch so everything is executed in one step and in the end everything is one undo/redo step.
      const currentData = ContentDropDataCache.lookupData(markerToMoveToLeft.name);
      if (!currentData) {
        return;
      }
      editor.model.enqueueChange("transparent", (writer: Writer): void => {
        const newRange = writer.createRange(beforeItemPosition, beforeItemPosition);
        writer.updateMarker(markerToMoveToLeft, { range: newRange });
      });
    });
  }

  static #moveMarkerForNextItemsToTheRight(editor: Editor, afterItemPosition: Position, markerData: MarkerData) {
    const markers: Array<Marker> = MarkerUtils.#findMarkersAfter(editor, markerData);
    markers.forEach((markerToMoveToLeft: Marker) => {
      //Each Marker has its own batch so everything is executed in one step and in the end everything is one undo/redo step.
      const currentData = ContentDropDataCache.lookupData(markerToMoveToLeft.name);
      if (!currentData) {
        return;
      }
      editor.model.enqueueChange("transparent", (writer: Writer): void => {
        const newRange = writer.createRange(afterItemPosition, afterItemPosition);
        writer.updateMarker(markerToMoveToLeft, { range: newRange });
      });
    });
  }

  static #findMarkersBefore(editor: Editor, markerData: MarkerData): Array<Marker> {
    const marker = editor.model.markers.get(ContentClipboardMarkerDataUtils.toMarkerNameFromData(markerData));
    if (!marker) {
      return [];
    }
    const markersAtSamePosition = MarkerUtils.#markersAtPosition(editor, marker.getStart());
    const itemIndex = markerData.itemIndex;
    const dropId = markerData.dropId;

    return markersAtSamePosition.filter((otherMarker: Marker) => {
      const otherMarkerData = ContentClipboardMarkerDataUtils.splitMarkerName(otherMarker.name);
      //dropId = Timestamp when a group of marker have been created.
      //If we are in the same group of markers (part of one drop) we want to adapt all markers with a
      //smaller index.
      if (otherMarkerData.dropId === dropId) {
        return otherMarkerData.itemIndex < itemIndex;
      }

      //If a drop done later to the same position happened we want to make sure all the dropped
      //items stay on the left of the marker.
      return otherMarkerData.dropId > dropId;
    });
  }

  static #findMarkersAfter(editor: Editor, markerData: MarkerData): Array<Marker> {
    const marker = editor.model.markers.get(ContentClipboardMarkerDataUtils.toMarkerNameFromData(markerData));
    if (!marker) {
      return [];
    }
    const markersAtSamePosition = MarkerUtils.#markersAtPosition(editor, marker.getStart());
    const itemIndex = markerData.itemIndex;
    const dropId = markerData.dropId;

    return markersAtSamePosition.filter((otherMarker: Marker) => {
      const otherMarkerData = ContentClipboardMarkerDataUtils.splitMarkerName(otherMarker.name);
      //dropId = Timestamp when a group of marker have been created.
      //If we are in the same group of markers (part of one drop) we want to adapt all markers with a
      //bigger index.
      if (otherMarkerData.dropId === dropId) {
        return otherMarkerData.itemIndex > itemIndex;
      }

      //If a drop done later to the same position happened we want to make sure all the dropped
      //items stay on the right of the marker.
      return otherMarkerData.dropId < dropId;
    });
  }

  static #markersAtPosition(editor: Editor, position: Position): Array<Marker> {
    return Array.from(
      editor.model.markers.getMarkersGroup(ContentClipboardMarkerDataUtils.CONTENT_DROP_MARKER_PREFIX)
    ).filter((value) => {
      return value.getStart().isEqual(position);
    });
  }
}
