/**
 * Utility class to create marker names for content drops and retrieve item index and drop id from a name.
 *
 * A marker name consists of 3 different parts that help to identify a marker as a part of a content drop
 * and determine its position inside a drop that contains multiple items.
 *
 * It basically looks like this:
 * [prefix]:[dropId]:[itemIndex]
 *
 * Example:
 * "content-drop:1642076134128:2"
 */
export class ContentClipboardMarkerDataUtils {
  static readonly CONTENT_DROP_MARKER_PREFIX = "content-drop";

  /**
   * Converts a marker name into its different parts
   *
   * @param markerName - the name of the marker
   * @returns an object containing the drop id and item index
   */
  static splitMarkerName(markerName: string): MarkerData {
    const data = markerName.split(":");
    return {
      prefix: data[0],
      dropId: Number(data[1]),
      itemIndex: Number(data[2]),
    };
  }

  /**
   * Creates a content-drop marker name from drop id and item index
   *
   * @param dropId - the identifier of the drop
   * @param itemIndex - the item index
   * @returns the name of the marker
   */
  static toMarkerName(dropId: number, itemIndex: number): string {
    return `${ContentClipboardMarkerDataUtils.CONTENT_DROP_MARKER_PREFIX}:${dropId}:${itemIndex}`;
  }

  /**
   * Creates a content-drop marker name from a markerData object
   *
   * @param markerData - markerData object
   * @returns the name of the marker
   */
  static toMarkerNameFromData(markerData: MarkerData): string {
    return `${ContentClipboardMarkerDataUtils.CONTENT_DROP_MARKER_PREFIX}:${markerData.dropId}:${markerData.itemIndex}`;
  }
}

export interface MarkerData {
  prefix: string;
  dropId: number;
  itemIndex: number;
}
