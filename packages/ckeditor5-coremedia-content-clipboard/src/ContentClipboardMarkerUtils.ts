export class ContentClipboardMarkerUtils {

  static splitMarkerName(markerName: string): MarkerData {
    const data = markerName.split(":");
    return {prefix: data[0], dropId: Number(data[1]), item: Number(data[2])};
  }

  static toMarkerName(prefix: string, dropId: number, item: number): string {
    return prefix + ":" + dropId + ":" + item
  }
  static toMarkerNameFromData(markerData: MarkerData): string {
    return markerData.prefix + ":" + markerData.dropId + ":" + markerData.item
  }
}

export type MarkerData = {
  prefix: string,
  dropId: number,
  item: number,
}