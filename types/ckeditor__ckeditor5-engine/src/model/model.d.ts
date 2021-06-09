import Emitter, { CallbackFunction } from "@ckeditor/ckeditor5-utils/src/emittermixin";
import Observable, { BindReturnValue } from "@ckeditor/ckeditor5-utils/src/observablemixin";
import Schema from "./schema";
import MarkerCollection from "./markercollection";
import Document from "./document";
import Operation from "./operation/operation";
import Writer from "./writer";
import Batch from "./batch";
import { Item } from "./item";
import Position, { PositionStickiness } from "./position";
import Element from "./element";
import DocumentFragment from "./documentfragment";
import Range from "./range";
import Selection, { Selectable } from "./selection";
import DocumentSelection from "./documentselection";
import { PriorityString } from "@ckeditor/ckeditor5-utils/src/priorities";
import EventInfo from "@ckeditor/ckeditor5-utils/src/eventinfo";
import DomEventData from "../view/observer/domeventdata";

/**
 * Editor's data model.
 *
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_model_model-Model.html">Class Model (engine/model/model~Model) - CKEditor 5 API docs</a>
 */
export default class Model implements Emitter, Observable {
  readonly document: Document;
  readonly markers: MarkerCollection;
  readonly schema: Schema;

  applyOperation(operation: Operation): void;

  change<T = any>(callback: (writer: Writer) => T): T;

  enqueueChange(batchOrType: any, callback: Function): void;

  createBatch(type?: 'transparent' | 'default'): Batch;

  createOperationFromJSON(json: Object): Operation;

  createPositionAfter(item: Item): Position;

  createPositionAt(itemOrPosition: Item | Position, offset?: number | 'end' | 'before' | 'after'): Position;

  createPositionBefore(item: Item): Position;

  createPositionFromPath(root: Element | DocumentFragment, path: Array<number>, stickiness?: PositionStickiness): Position;

  createRange(start: Position, end?: Position): Range;

  createRangeIn(element: Element): Range;

  createRangeOn(item: Item): Range;

  createSelection(selectable: Selectable, placeOrOffset?: number | 'before' | 'end' | 'after' | 'on' | 'in', options?: {
    backward?: boolean;
  }): any;

  deleteContent(selection: Selection, options?: {
    leaveUnmerged?: boolean;
    doNotResetEntireContent?: boolean;
    doNotAutoparagraph?: boolean;
    direction?: 'forward' | 'backward';
  }): void;

  enqueueChange(batchOrType: Batch | 'transparent' | 'default', callback: (writer: Writer) => void): void;

  getSelectedContent(selection: Selection | DocumentSelection): DocumentFragment;

  hasContent(rangeOrElement: Range | Element, options?: {
    ignoreWhitespaces?: boolean;
    ignoreMarkers?: boolean;
  }): boolean;

  insertContent(content: DocumentFragment | Item, selectable?: Selectable, placeOrOffset?: number | 'before' | 'end' | 'after' | 'on' | 'in'): any;

  modifySelection(selection: Selection | DocumentSelection, options?: {
    direction?: 'forward' | 'backward';
    unit?: 'character' | 'codePoint' | 'word';
  }): void;

  destroy(): void;

  bind(...bindProperties: any[]): BindReturnValue;

  set(name: string | Object, value?: any): void;

  on(event: string, callback: CallbackFunction, options?: { priority: PriorityString | number }): void;

  off(event: string, callback?: CallbackFunction): void;

  once(event: string, callback: CallbackFunction, options?: { priority: PriorityString | number }): void;

  fire(eventOrInfo: string | EventInfo, ...args: any[]): any;

  stopListening(emitter?: Emitter, event?: string, callback?: (info: EventInfo, data: DomEventData) => void): void;
}
