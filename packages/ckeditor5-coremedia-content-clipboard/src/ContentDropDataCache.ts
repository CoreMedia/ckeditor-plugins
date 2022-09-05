import Batch from "@ckeditor/ckeditor5-engine/src/model/batch";

/**
 * A cache to store data about content input.
 * This cache stores ContentDropData objects, which consist of 2 parts:
 *
 * 1. An itemContext, which holds information about the drop item itself
 * 2. A dropContext, that holds information about the drop
 *
 * The data object must be saved by using the corresponding marker name as the map key.
 */
export default class ContentDropDataCache {
  static readonly #contentDropDataCache = new Map<string, ContentDropData>();

  /**
   * Stores a ContentDropData object for a given marker name.
   *
   * @param contentDropMarkerName - the name of the content drop marker
   * @param contentDropData - the ContentDropData object
   */
  static storeData(contentDropMarkerName: string, contentDropData: ContentDropData): void {
    ContentDropDataCache.#contentDropDataCache.set(contentDropMarkerName, contentDropData);
  }

  /**
   * Retrieves a ContentDropData object for a given marker name.
   *
   * @param contentDropMarkerName - the name of the content drop marker
   * @returns the ContentDropData object or undefined
   */
  static lookupData(contentDropMarkerName: string): ContentDropData | undefined {
    return ContentDropDataCache.#contentDropDataCache.get(contentDropMarkerName);
  }

  /**
   * Removes the stored data for a given marker name.
   *
   * @param contentDropMarkerName - the name of the content drop marker
   */
  static removeData(contentDropMarkerName: string): void {
    ContentDropDataCache.#contentDropDataCache.delete(contentDropMarkerName);
  }
}

export interface ContentDropData {
  dropContext: DropContext;
  itemContext: ItemContext;
}

export interface ItemContext {
  contentUri: string;
  isInline: boolean;
  itemIndex: number;
}

export interface DropContext {
  dropId: number;
  batch: Batch;
  selectedAttributes: [string, string | number | boolean][];
}
