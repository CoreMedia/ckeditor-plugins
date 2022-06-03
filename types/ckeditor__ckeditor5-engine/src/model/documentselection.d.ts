import {CallbackFunction, Emitter, EmitterMixinDelegateChain} from "@ckeditor/ckeditor5-utils/src/emittermixin";
import { PriorityString } from "@ckeditor/ckeditor5-utils/src/priorities";
import Position from "./position";
import Collection from "@ckeditor/ckeditor5-utils/src/collection";
import { Marker } from "./markercollection";
import Document from "./document";
import Element from "./element";
import Range from "./range";
import Selection from "./selection";
import EventInfo from "@ckeditor/ckeditor5-utils/src/eventinfo";
import DomEventData from "../view/observer/domeventdata";

/**
 * `DocumentSelection` is a special selection which is used as the
 * {@link module:engine/model/document~Document#selection document's selection}.
 *
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_model_documentselection-DocumentSelection.html">Class DocumentSelection (engine/model/documentselection~DocumentSelection) - CKEditor 5 API docs</a>
 */
export default class DocumentSelection implements Emitter {
  get anchor(): Position | null;

  get focus(): Position | null;

  get hasOwnRange(): boolean;

  get isBackward(): boolean;

  get isCollapsed(): boolean;

  get isGravityOverridden(): boolean;

  get markers(): Collection<Marker>;

  get rangeCount(): number;

  constructor(doc: Document);

  containsEntireContent(element?: Element): boolean;

  destroy(): void;

  getAttribute(key: string): any | undefined;

  getAttributeKeys(): IterableIterator<string>;

  getAttributes(): IterableIterator<[string, string | number | boolean]>;

  getFirstPosition(): Position | null;

  getFirstRange(): Range | null;

  getLastPosition(): Position | null;

  getLastRange(): Range | null;

  getRanges(): Iterable<Range>;

  getSelectedBlocks(): ReturnType<Selection['getSelectedBlocks']>;

  getSelectedElement(): Element | null;

  hasAttribute(key: any): any;

  is(type: string): boolean;

  observeMarkers(prefixOrName: string): void;

  refresh(): void;

  on(event: string, callback: CallbackFunction, options?: { priority: PriorityString | number }): void;

  once(event: string, callback: CallbackFunction, options?: { priority: PriorityString | number }): void;

  off(event: string, callback?: CallbackFunction): void;

  fire(eventOrInfo: string | EventInfo, ...args: any[]): any;

  stopListening(emitter?: Emitter, event?: string, callback?: CallbackFunction): void;

  listenTo(emitter: Emitter, event: string, callback: CallbackFunction, options?: { priority: PriorityString | number }): void;

  delegate(...events: string[]): EmitterMixinDelegateChain;
}

export type SelectionRangeChangeEventData = {directChange: boolean}
