export class ContentClipboardMarkerUtils {
  static readonly CONTENT_DROP_MARKER_PREFIX = "content-drop"

  static splitMarkerName(markerName: string): MarkerData {
    const data = markerName.split(":");
    return {prefix: data[0], dropId: Number(data[1]), itemIndex: Number(data[2])};
  }

  static toMarkerName(dropId: number, item: number): string {
    return ContentClipboardMarkerUtils.CONTENT_DROP_MARKER_PREFIX + ":" + dropId + ":" + item
  }
  static toMarkerNameFromData(markerData: MarkerData): string {
    return ContentClipboardMarkerUtils.CONTENT_DROP_MARKER_PREFIX + ":" + markerData.dropId + ":" + markerData.itemIndex
  }
}

export type MarkerData = {
  prefix: string,
  dropId: number,
  itemIndex: number,
}