/**
 * Utility class to create marker names for content insertions and retrieve item
 * index and insertion id from a name.
 *
 * A marker name consists of 3 different parts that help to identify a marker as
 * a part of a content input and determine its position inside an insertion that
 * contains multiple items.
 *
 * It basically looks like this:
 *
 * ```text
 * [prefix]:[insertionId]:[itemIndex]
 * ```
 *
 * @example
 * ```text
 * "content-input:1642076134128:2"
 * ```
 */
export class ContentClipboardMarkerDataUtils {
  static readonly CONTENT_INPUT_MARKER_PREFIX = "content-input";

  /**
   * Converts a marker name into its different parts
   *
   * @param markerName - the name of the marker
   * @returns an object containing the insertion id and item index
   */
  static splitMarkerName(markerName: string): MarkerData {
    const data = markerName.split(":");
    return {
      prefix: data[0],
      insertionId: Number(data[1]),
      itemIndex: Number(data[2]),
    };
  }

  /**
   * Creates a content-input marker name from insertion id and item index
   *
   * @param insertionId - the identifier of the insertion
   * @param itemIndex - the item index
   * @returns the name of the marker
   */
  static toMarkerName(insertionId: number, itemIndex: number): string {
    return `${ContentClipboardMarkerDataUtils.CONTENT_INPUT_MARKER_PREFIX}:${insertionId}:${itemIndex}`;
  }

  /**
   * Creates a content-input marker name from a markerData object
   *
   * @param markerData - markerData object
   * @returns the name of the marker
   */
  static toMarkerNameFromData(markerData: MarkerData): string {
    return `${ContentClipboardMarkerDataUtils.CONTENT_INPUT_MARKER_PREFIX}:${markerData.insertionId}:${markerData.itemIndex}`;
  }
}

/**
 * Input Marker Representation.
 */
export interface MarkerData {
  /**
   * Prefix of the inserted marker.
   */
  prefix: string;
  /**
   * ID of the inserted object.
   */
  insertionId: number;
  /**
   * Index of the relevant item in the inserted object.
   */
  itemIndex: number;
}
