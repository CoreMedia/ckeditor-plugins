import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import { ContentClipboardMarkerDataUtils, MarkerData } from "./ContentClipboardMarkerDataUtils";
import ModelPosition from "@ckeditor/ckeditor5-engine/src/model/position";
import ContentDropDataCache from "./ContentDropDataCache";
import Writer from "@ckeditor/ckeditor5-engine/src/model/writer";

type MarkerFilterFunction = (markerData: MarkerData, otherMarkerData: MarkerData) => boolean;

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default class MarkerRepositionUtil {
  static repositionMarkers(
    editor: Editor,
    markerData: MarkerData,
    beforeItemPosition: ModelPosition,
    afterItemPosition: ModelPosition
  ): void {
    MarkerRepositionUtil.#moveMarkerForNextItemsToTheRight(editor, afterItemPosition, markerData);
    MarkerRepositionUtil.#moveMarkerForPreviousItemsToLeft(editor, beforeItemPosition, markerData);
  }

  static #moveMarkerForPreviousItemsToLeft(editor: Editor, beforeItemPosition: ModelPosition, markerData: MarkerData) {
    const markers: MarkerData[] = MarkerRepositionUtil.#findMarkers(
      editor,
      markerData,
      MarkerRepositionUtil.#markerBeforeFilterPredicate
    );

    MarkerRepositionUtil.#moveMarkersTo(editor, markers, beforeItemPosition);
  }

  static #moveMarkerForNextItemsToTheRight(editor: Editor, afterItemPosition: ModelPosition, markerData: MarkerData) {
    const markers: MarkerData[] = MarkerRepositionUtil.#findMarkers(
      editor,
      markerData,
      MarkerRepositionUtil.#markerAfterFilterPredicate
    );
    MarkerRepositionUtil.#moveMarkersTo(editor, markers, afterItemPosition);
  }

  static #findMarkers(editor: Editor, markerData: MarkerData, filterFunction: MarkerFilterFunction): MarkerData[] {
    const marker = editor.model.markers.get(ContentClipboardMarkerDataUtils.toMarkerNameFromData(markerData));
    if (!marker) {
      return [];
    }
    const markersAtSamePosition = MarkerRepositionUtil.#markersAtPosition(editor, marker.getStart());

    return markersAtSamePosition.filter((otherMarkerData: MarkerData): boolean =>
      filterFunction(markerData, otherMarkerData)
    );
  }

  static #markersAtPosition(editor: Editor, position: ModelPosition): MarkerData[] {
    return Array.from(editor.model.markers.getMarkersGroup(ContentClipboardMarkerDataUtils.CONTENT_DROP_MARKER_PREFIX))
      .filter((value) => value.getStart().isEqual(position))
      .map((value) => ContentClipboardMarkerDataUtils.splitMarkerName(value.name));
  }

  static #moveMarkersTo(editor: Editor, markerData: MarkerData[], position: ModelPosition): void {
    markerData.forEach((moveMarkerData: MarkerData) => {
      //Each Marker has its own batch so everything is executed in one step and in the end everything is one undo/redo step.
      const moveMarkerName = ContentClipboardMarkerDataUtils.toMarkerNameFromData(moveMarkerData);

      //Check if the marker we want to move still exists.
      const currentData = ContentDropDataCache.lookupData(moveMarkerName);
      if (!currentData) {
        return;
      }
      editor.model.enqueueChange({ isUndoable: false }, (writer: Writer): void => {
        const newRange = writer.createRange(position, position);
        writer.updateMarker(moveMarkerName, { range: newRange });
      });
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
}
