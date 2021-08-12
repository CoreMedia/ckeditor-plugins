import Text from "./text";
import Element from "./element";
import DocumentFragment from "./documentfragment";
import { Item } from "./item";
import Position, { PositionStickiness } from "./position";
import Node from "./node";
import Batch from "./batch";
import Model from "./model";
import Range from "./range";
import Selection, { Selectable } from "./selection";
import { Marker } from "./markercollection";

type Offset = number | "end" | "before" | "after";

type Place = "in" | "on";

/**
 * The model can only be modified by using the writer. It should be used whenever you want to create a node, modify
 * child nodes, attributes or text, set the selection's position and its attributes.
 *
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_model_writer-Writer.html">Class Writer (engine/model/writer~Writer) - CKEditor 5 API docs</a>
 */
export default class Writer {
  get batch(): Batch;

  get model(): Model;

  addMarker(name: string, options: {
    usingOperation: boolean;
    range: Range;
    affectsData?: boolean;
  }): Marker;

  append(item: Item | DocumentFragment, parent: Element | DocumentFragment): void;

  appendText(text: string, attributes: Object, parent: Element | DocumentFragment): void;

  appendElement(name: string, attributes: Object, parent: Element | DocumentFragment): void;

  clearAttributes(itemOrRange: Item | Range): void;

  cloneElement(element: Element, deep?: boolean): Element;

  createDocumentFragment(): DocumentFragment;

  createElement(name: string, attributes?: Object): Element;

  createPositionAfter(item: Item): Position;

  createPositionAt(itemOrPosition: Item | Position, offset?: Offset): Position;

  createPositionBefore(item: Item): Position;

  createPositionFromPath(root: Element | DocumentFragment, path: number[], stickiness?: PositionStickiness): Position;

  createRange(start: Position, end?: Position): Range;

  createRangeIn(element: Element): Range;

  createRangeOn(element: Element): Range;

  createSelection(selectable: Selectable, placeOrOffset?: Place | Offset, options?: {
    backward?: boolean;
  }): Selection;

  createText(data: string, attributes?: Object): Text;

  insert(item: Item | DocumentFragment, itemOrPosition: Item | Position, offset?: Offset): void;

  insertElement(name: string, attributes: Object, itemOrPosition: Item | Position, offset?: Offset): void;

  insertText(text: string, attributes: Object, itemOrPosition: Item | Position, offset?: Offset): void;

  insertText(text: string, itemOrPosition: Item, offset?: Offset): void;

  merge(position: Position): void;

  move(range: Range, itemOrPosition: Item | Position, offset?: Offset): void;

  overrideSelectionGravity(): string;

  remove(itemOrRange: Item | Range): void;

  removeAttribute(key: string, itemOrRange: Item | Range): void;

  removeMarker(markerOrName: Marker | string): void;

  removeSelectionAttribute(keyOrIterableOfKeys: string | string[]): void;

  rename(element: Element, newName: string): void;

  restoreSelectionGravity(uid: string): void;

  setAttribute(key: string, value: any, itemOrRange: Item | Range): void;

  setAttributes(attributes: Object, itemOrRange: Item | Range): void;

  setSelection(selectable: Selectable, placeOrOffset?: Place | Offset, options?: {
    backward?: boolean;
  }): void;

  setSelectionAttribute(keyOrObjectOrIterable: string | Object | Iterable<any>, value: any): void;

  setSelectionFocus(itemOrPosition: Item | Position, offset?: Offset): void;

  split(position: Position, limitElement?: Node): {
    position: Position;
    range: any;
  };

  updateMarker(markerOrName: Marker | string, options?: {
    range?: Range;
    usingOperation?: boolean;
    affectsData?: boolean;
  }): void;

  unwrap(element: Element): void;

  wrap(range: Range, elementOrString: Element | string): void;
}
