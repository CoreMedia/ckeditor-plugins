import Batch from "@ckeditor/ckeditor5-engine/src/model/batch";

export default class ContentDropDataCache {
  static readonly #contentDropDataCache = new Map<string, ContentDropData>();

  static storeData(contentDropMarkerName: string, contentDropData: ContentDropData): void {
    ContentDropDataCache.#contentDropDataCache.set(contentDropMarkerName, contentDropData);
  }

  static lookupData(contentDropMarkerName: string): ContentDropData | undefined {
    return ContentDropDataCache.#contentDropDataCache.get(contentDropMarkerName);
  }

  static removeData(contentDropMarkerName: string): void {
    ContentDropDataCache.#contentDropDataCache.delete(contentDropMarkerName);
  }
}

export type ContentDropData = {
  dropContext: DropContext,
  itemContext: ItemContext
}

export type ItemContext = {
  contentUri: string,
  isEmbeddableContent: boolean,
  itemIndex: number
}

export type DropContext = {
  dropId: number,
  batch: Batch,
  selectedAttributes: Array<[string, string | number | boolean]>,
  multipleItemsDropped: boolean
}
