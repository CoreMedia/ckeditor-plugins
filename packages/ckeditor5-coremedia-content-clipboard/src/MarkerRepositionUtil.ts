import { ContentClipboardMarkerDataUtils, MarkerData } from "./ContentClipboardMarkerDataUtils";
import { Editor, Position as ModelPosition, Writer } from "ckeditor5";
import ContentInputDataCache from "./ContentInputDataCache";
type MarkerFilterFunction = (markerData: MarkerData, otherMarkerData: MarkerData) => boolean;

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default class MarkerRepositionUtil {
  static repositionMarkers(
    editor: Editor,
    markerData: MarkerData,
    beforeItemPosition: ModelPosition,
    afterItemPosition: ModelPosition,
  ): void {
    MarkerRepositionUtil.#moveMarkerForNextItemsToTheRight(editor, afterItemPosition, markerData);
    MarkerRepositionUtil.#moveMarkerForPreviousItemsToLeft(editor, beforeItemPosition, markerData);
  }
  static #moveMarkerForPreviousItemsToLeft(editor: Editor, beforeItemPosition: ModelPosition, markerData: MarkerData) {
    const markers: MarkerData[] = MarkerRepositionUtil.#findMarkers(
      editor,
      markerData,
      MarkerRepositionUtil.#markerBeforeFilterPredicate,
    );
    MarkerRepositionUtil.#moveMarkersTo(editor, markers, beforeItemPosition);
  }
  static #moveMarkerForNextItemsToTheRight(editor: Editor, afterItemPosition: ModelPosition, markerData: MarkerData) {
    const markers: MarkerData[] = MarkerRepositionUtil.#findMarkers(
      editor,
      markerData,
      MarkerRepositionUtil.#markerAfterFilterPredicate,
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
      filterFunction(markerData, otherMarkerData),
    );
  }
  static #markersAtPosition(editor: Editor, position: ModelPosition): MarkerData[] {
    return Array.from(editor.model.markers.getMarkersGroup(ContentClipboardMarkerDataUtils.CONTENT_INPUT_MARKER_PREFIX))
      .filter((value) => value.getStart().isEqual(position))
      .map((value) => ContentClipboardMarkerDataUtils.splitMarkerName(value.name));
  }
  static #moveMarkersTo(editor: Editor, markerData: MarkerData[], position: ModelPosition): void {
    markerData.forEach((moveMarkerData: MarkerData) => {
      //Each Marker has its own batch, so everything is executed in one step, and in the end, everything is one undo/redo step.
      const moveMarkerName = ContentClipboardMarkerDataUtils.toMarkerNameFromData(moveMarkerData);

      //Check if the marker we want to move still exists.
      const currentData = ContentInputDataCache.lookupData(moveMarkerName);
      if (!currentData) {
        return;
      }
      editor.model.enqueueChange(
        {
          isUndoable: false,
        },
        (writer: Writer): void => {
          const newRange = writer.createRange(position, position);
          writer.updateMarker(moveMarkerName, {
            range: newRange,
          });
        },
      );
    });
  }
  static readonly #markerBeforeFilterPredicate: MarkerFilterFunction = (markerData, otherMarkerData) => {
    const itemIndex = markerData.itemIndex;
    const insertionId = markerData.insertionId;

    // insertionId = Timestamp when a group of markers has been created.
    // If we are in the same group of markers (part of one insertion), we want to adapt all markers with a
    // smaller index.
    if (otherMarkerData.insertionId === insertionId) {
      return otherMarkerData.itemIndex < itemIndex;
    }

    // If an insertion done later to the same position, we want to make sure all the inserted
    // items stay on the left of the marker.
    return otherMarkerData.insertionId > insertionId;
  };
  static readonly #markerAfterFilterPredicate: MarkerFilterFunction = (markerData, otherMarkerData) => {
    const itemIndex = markerData.itemIndex;
    const insertionId = markerData.insertionId;

    // insertionId = Timestamp when a group of markers has been created.
    // If we are in the same group of markers (part of one insertion), we want to adapt all markers with a
    // bigger index.
    if (otherMarkerData.insertionId === insertionId) {
      return otherMarkerData.itemIndex > itemIndex;
    }

    // If an insert appears to the same position later on, we want to make
    // sure all the inserted items stay on the right of the marker.
    return otherMarkerData.insertionId < insertionId;
  };
}
