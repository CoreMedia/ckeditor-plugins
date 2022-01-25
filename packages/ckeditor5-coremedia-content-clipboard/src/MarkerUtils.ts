import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import { ContentClipboardMarkerDataUtils, MarkerData } from "./ContentClipboardMarkerDataUtils";
import ModelPosition from "@ckeditor/ckeditor5-engine/src/model/position";
import Position from "@ckeditor/ckeditor5-engine/src/model/position";
import ContentDropDataCache from "./ContentDropDataCache";
import Writer from "@ckeditor/ckeditor5-engine/src/model/writer";

type MarkerFilterFunction = (markerData: MarkerData, otherMarkerData: MarkerData) => boolean;

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
    const markers: Array<MarkerData> = MarkerUtils.#findMarkers(
      editor,
      markerData,
      MarkerUtils.#markerBeforeFilterPredicate
    );
    markers.forEach((markerToMoveToLeft: MarkerData) => {
      //Each Marker has its own batch so everything is executed in one step and in the end everything is one undo/redo step.
      const markerName = ContentClipboardMarkerDataUtils.toMarkerNameFromData(markerToMoveToLeft);
      const currentData = ContentDropDataCache.lookupData(markerName);
      if (!currentData) {
        return;
      }
      editor.model.enqueueChange("transparent", (writer: Writer): void => {
        const newRange = writer.createRange(beforeItemPosition, beforeItemPosition);
        writer.updateMarker(markerName, { range: newRange });
      });
    });
  }

  static #moveMarkerForNextItemsToTheRight(editor: Editor, afterItemPosition: Position, markerData: MarkerData) {
    const markers: Array<MarkerData> = MarkerUtils.#findMarkers(
      editor,
      markerData,
      MarkerUtils.#markerAfterFilterPredicate
    );
    markers.forEach((markerDataToRight: MarkerData) => {
      //Each Marker has its own batch so everything is executed in one step and in the end everything is one undo/redo step.
      const markerNameToRight = ContentClipboardMarkerDataUtils.toMarkerNameFromData(markerDataToRight);
      const currentData = ContentDropDataCache.lookupData(markerNameToRight);
      if (!currentData) {
        return;
      }
      editor.model.enqueueChange("transparent", (writer: Writer): void => {
        const newRange = writer.createRange(afterItemPosition, afterItemPosition);
        writer.updateMarker(markerNameToRight, { range: newRange });
      });
    });
  }

  static #findMarkers(editor: Editor, markerData: MarkerData, filterFunction: MarkerFilterFunction): Array<MarkerData> {
    const marker = editor.model.markers.get(ContentClipboardMarkerDataUtils.toMarkerNameFromData(markerData));
    if (!marker) {
      return [];
    }
    const markersAtSamePosition = MarkerUtils.#markersAtPosition(editor, marker.getStart());

    return markersAtSamePosition.filter((otherMarkerData: MarkerData) => {
      filterFunction(markerData, otherMarkerData);
    });
  }

  static #markerBeforeFilterPredicate: MarkerFilterFunction = (markerData, otherMarkerData) => {
    const itemIndex = markerData.itemIndex;
    const dropId = markerData.dropId;

    //dropId = Timestamp when a group of marker have been created.
    //If we are in the same group of markers (part of one drop) we want to adapt all markers with a
    //smaller index.
    if (otherMarkerData.dropId === dropId) {
      return otherMarkerData.itemIndex < itemIndex;
    }

    //If a drop done later to the same position happened we want to make sure all the dropped
    //items stay on the left of the marker.
    return otherMarkerData.dropId > dropId;
  };

  static #markerAfterFilterPredicate: MarkerFilterFunction = (markerData, otherMarkerData) => {
    const itemIndex = markerData.itemIndex;
    const dropId = markerData.dropId;

    //dropId = Timestamp when a group of marker have been created.
    //If we are in the same group of markers (part of one drop) we want to adapt all markers with a
    //bigger index.
    if (otherMarkerData.dropId === dropId) {
      return otherMarkerData.itemIndex > itemIndex;
    }

    //If a drop done later to the same position happened we want to make sure all the dropped
    //items stay on the right of the marker.
    return otherMarkerData.dropId < dropId;
  };

  static #markersAtPosition(editor: Editor, position: Position): Array<MarkerData> {
    return Array.from(editor.model.markers.getMarkersGroup(ContentClipboardMarkerDataUtils.CONTENT_DROP_MARKER_PREFIX))
      .filter((value) => {
        return value.getStart().isEqual(position);
      })
      .map((value) => {
        return ContentClipboardMarkerDataUtils.splitMarkerName(value.name);
      });
  }
}
