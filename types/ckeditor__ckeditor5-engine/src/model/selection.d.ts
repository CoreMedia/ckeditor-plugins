import Emitter, { CallbackFunction, EmitterMixinDelegateChain} from "@ckeditor/ckeditor5-utils/src/emittermixin";
import Position from "./position";
import DocumentSelection from "./documentselection";
import Element from "./element";
import Node from "./node";
import {Item} from "./item";
import {PriorityString} from "@ckeditor/ckeditor5-utils/src/priorities";
import EventInfo from "@ckeditor/ckeditor5-utils/src/eventinfo";
import DomEventData from "../view/observer/domeventdata";

/**
 * Selection is a set of {@link module:engine/model/range~Range ranges}.
 *
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_model_selection-Selection.html">Class Selection (engine/model/selection~Selection) - CKEditor 5 API docs</a>
 */
export default class Selection implements Emitter {
  get anchor(): Position | null;

  get focus(): Position | null;

  get isBackward(): boolean;

  get isCollapsed(): boolean;

  get rangeCount(): number;

  constructor(selectable: Selectable, placeOrOffset?: number | 'before' | 'end' | 'after' | 'on' | 'in', options?: {
    backward?: boolean;
  });

  delegate(...events: string[]): EmitterMixinDelegateChain;

  containsEntireContent(element?: Element): boolean;

  getAttribute(key: string): any | undefined;

  getAttributeKeys(): IterableIterator<string>;

  getAttributes(): IterableIterator<[string, string | boolean | number]>;

  getFirstPosition(): Position | null;

  getFirstRange(): Range | null;

  getLastPosition(): Position | null;

  getLastRange(): Range | null;

  getRanges(): Iterable<Range>;

  getSelectedBlocks(): Iterable<Element>;

  getSelectedElement(): Element | null;

  hasAttribute(key: string): boolean;

  is(type: string): boolean;

  isEqual(otherSelection: Selection): boolean;

  removeAttribute(key: string): void;

  setAttribute(key: string, value: any): void;

  setFocus(itemOrPosition: Item | Position, offset?: number | 'end' | 'before' | 'after'): void;

  setTo(selectable: Selectable, placeOrOffset?: number | 'before' | 'end' | 'after' | 'on' | 'in', options?: {
    backward?: boolean;
  }): void;

  on(event: string, callback: CallbackFunction, options?: { priority: PriorityString | number }): void;

  off(event: string, callback?: CallbackFunction): void;

  once(event: string, callback: CallbackFunction, options?: { priority: PriorityString | number }): void;

  fire(eventOrInfo: string | EventInfo, ...args: any[]): any;

  stopListening(emitter?: Emitter, event?: string, callback?: CallbackFunction): void;

  listenTo(emitter: Emitter, event: string, callback: CallbackFunction, options?: { priority: PriorityString | number }): void;
}

/**
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_model_selection-Selectable.html">Typedef Selectable (engine/model/selection~Selectable) - CKEditor 5 API docs</a>
 */
export type Selectable = Selection | DocumentSelection | Position | Range | Node | Iterable<Range> | null;
