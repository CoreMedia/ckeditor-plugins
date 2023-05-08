import { Batch } from "@ckeditor/ckeditor5-engine";

/**
 * A cache to store data about content input.
 * This cache stores ContentInputData objects, which consist of 2 parts:
 *
 * 1. An itemContext, which holds information about the inserted item itself
 * 2. An insertionContext, which holds information about the insertion
 *
 * The data object must be saved by using the corresponding marker name as the map key.
 */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default class ContentInputDataCache {
  static readonly #contentInputDataCache = new Map<string, ContentInputData>();

  /**
   * Stores a ContentInputData object for a given marker name.
   *
   * @param contentInputMarkerName - the name of the content input marker
   * @param contentInputData - the ContentInputData object
   */
  static storeData(contentInputMarkerName: string, contentInputData: ContentInputData): void {
    ContentInputDataCache.#contentInputDataCache.set(contentInputMarkerName, contentInputData);
  }

  /**
   * Retrieves a ContentInputData object for a given marker name.
   *
   * @param contentInputMarkerName - the name of the content input marker
   * @returns the ContentInputData object or undefined
   */
  static lookupData(contentInputMarkerName: string): ContentInputData | undefined {
    return ContentInputDataCache.#contentInputDataCache.get(contentInputMarkerName);
  }

  /**
   * Removes the stored data for a given marker name.
   *
   * @param contentInputMarkerName - the name of the content input marker
   */
  static removeData(contentInputMarkerName: string): void {
    ContentInputDataCache.#contentInputDataCache.delete(contentInputMarkerName);
  }
}

export interface ContentInputData {
  insertionContext: InsertionContext;
  itemContext: ItemContext;
}

export interface ItemContext {
  uri: string;
  isInline: boolean;
  itemIndex: number;
}

export interface InsertionContext {
  insertionId: number;
  batch: Batch;
  selectedAttributes: [string, unknown][];
}
