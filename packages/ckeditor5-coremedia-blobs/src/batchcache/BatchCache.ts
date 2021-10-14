import Batch from "@ckeditor/ckeditor5-engine/src/model/batch";

export default class BatchCache {
  static readonly #batchCache = new Map<string, Batch>();

  static storeBatch(identifier: string, batch: Batch): void {
    BatchCache.#batchCache.set(identifier, batch);
  }

  static lookupBatch(identifier: string): Batch | undefined {
    return BatchCache.#batchCache.get(identifier);
  }

  static removeBatch(identifier: string): void {
    BatchCache.#batchCache.delete(identifier);
  }
}
