import Batch from "@ckeditor/ckeditor5-engine/src/model/batch";

export default class PlaceholderDataCache {
  static readonly #placeholderDataCache = new Map<string, PlaceholderData>();

  static storeData(identifier: string, placeholderData: PlaceholderData): void {
    PlaceholderDataCache.#placeholderDataCache.set(identifier, placeholderData);
  }

  static lookupData(identifier: string): PlaceholderData | undefined {
    return PlaceholderDataCache.#placeholderDataCache.get(identifier);
  }

  static removeData(identifier: string): void {
    PlaceholderDataCache.#placeholderDataCache.delete(identifier);
  }
}

export type PlaceholderData = {
  batch: Batch,
  selectedAttributes: Array<[string, string | number | boolean]>,
  contentUri: string,
  isEmbeddableContent: boolean,
  dropContext: {
    multipleItemsDropped: boolean
  }
};
