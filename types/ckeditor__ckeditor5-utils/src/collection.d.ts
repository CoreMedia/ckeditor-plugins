import Emitter, { CallbackFunction } from "./emittermixin";
import { PriorityString } from "./priorities";

/**
 * Collections are ordered sets of objects. Items in the collection can be retrieved by their indexes
 * in the collection (like in an array) or by their ids.
 *
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_utils_collection-Collection.html">Class Collection (utils/collection~Collection) - CKEditor 5 API docs</a>
 */
export default class Collection<T = any> implements Emitter {
  get first(): T | null;

  get length(): number;

  get last(): T | null;

  constructor(initialItemsOrOptions?: Iterable<T> | CollectionOptions, options?: CollectionOptions);

  [Symbol.iterator](): Iterable<T>;

  add(item: T, index?: number): this;

  addMany(items: Iterable<T>, index?: number): this;

  bindTo(externalCollection: Collection): CollectionBindToChain;

  clear(): void;

  filter(callback: (item: T, index: number) => boolean, ctx: any): T[];

  find(callback: (item: T, index: number) => boolean, ctx: any): T;

  get(idOrIndex: string | number): T | null;

  getIndex(itemOrId: T | string): number | -1;

  has(itemOrId: T | string): boolean;

  map<M = any>(callback: (item: T, index: number) => M, ctx: any): M[];

  remove(subject: T | number | string): T;

  on(event: string, callback: CallbackFunction, options?: { priority: PriorityString | number }): void;

  once(event: string, callback: CallbackFunction, options?: { priority: PriorityString | number }): void;
}

export type CollectionOptions = {
  idProperty: string,
};

/**
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_utils_collection-CollectionBindToChain.html">Interface CollectionBindToChain (utils/collection~CollectionBindToChain) - CKEditor 5 API docs</a>
 */
export interface CollectionBindToChain {
  as(Class: Function): void;

  using(callbackOrProperty: Function | string): void;
}
