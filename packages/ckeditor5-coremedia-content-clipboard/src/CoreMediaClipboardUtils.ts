import ClipboardEventData from "@ckeditor/ckeditor5-clipboard/src/clipboardobserver";
import { extractContentUriPathsFromDragEventJsonData } from "@coremedia/ckeditor5-coremedia-studio-integration/content/DragAndDropUtils";

export default class CoreMediaClipboardUtils {
  /**
   * Extract content-URIs from clipboard. Content-URIs are stored within
   * `cm/uri-list` and contain the URIs in the form `content/42` (wrapped
   * by some JSON).
   *
   * @param data - data to get content URIs from
   * @returns array of content-URIs, possibly empty; `null` signals, that the data did not contain content-URI data
   * @private
   */
  static extractContentUris(data: ClipboardEventData): string[] | null {
    if (data === null || data.dataTransfer === null) {
      return null;
    }

    const cmUriList = data.dataTransfer.getData("cm/uri-list");

    if (!cmUriList) {
      return null;
    }
    return extractContentUriPathsFromDragEventJsonData(cmUriList);
  }

  static isContentInput(data: ClipboardEventData): boolean {
    return !!CoreMediaClipboardUtils.extractContentUris(data);
  }
}
