import Emitter, { CallbackFunction } from "@ckeditor/ckeditor5-utils/src/emittermixin";
import Observable, { BindReturnValue } from "@ckeditor/ckeditor5-utils/src/observablemixin";
import { PriorityString } from "@ckeditor/ckeditor5-utils/src/priorities";
import Node from "./node";
import Position from "./position";
import Element from "./element";
import { Item } from "./item";
import Range from "./range";
import EventInfo from "@ckeditor/ckeditor5-utils/src/eventinfo";
import DomEventData from "../view/observer/domeventdata";


/**
 * The model's schema. It defines allowed and disallowed structures of nodes as well as nodes' attributes.
 *
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_model_schema-Schema.html">Class Schema (engine/model/schema~Schema) - CKEditor 5 API docs</a>
 */
export default class Schema implements Emitter, Observable {
  constructor();

  addAttributeCheck(callback: (context: SchemaContext, attributeName: string) => boolean | undefined): void;

  addChildCheck(callback: (context: SchemaContext, childDefinition: SchemaCompiledItemDefinition) => boolean | undefined): void;

  checkAttribute(context: SchemaContextDefinition, attributeName: string): boolean;

  checkAttributeInSelection(selection: any, attribute: string): boolean;

  checkChild(context: SchemaContextDefinition, def: Node | string): void;

  checkMerge(positionOrBaseElement: Position | Element, elementToMerge: Element): boolean;

  createContext(context: SchemaContextDefinition): SchemaContext;

  extend(itemName: string, definition: SchemaItemDefinition): void;

  findAllowedParent(position: Position, node: Node | string): Element | null;

  getAttributeProperties(attributeName: string): AttributeProperties;

  getDefinition(item: Item | SchemaContextItem | string): SchemaCompiledItemDefinition;

  getValidRanges(ranges: Iterable<Range>, attribute: string): Iterable<Range>;

  register(itemName: string, definition: SchemaItemDefinition): void;

  bind(...bindProperties: any[]): BindReturnValue;

  on(event: string, callback: CallbackFunction, options?: { priority: PriorityString | number }): void;

  off(event: string, callback?: CallbackFunction): void;

  once(event: string, callback: CallbackFunction, options?: { priority: PriorityString | number }): void;

  set(name: string | Object, value?: any): void;

  fire(eventOrInfo: string | EventInfo, ...args: any[]): any;

  stopListening(emitter?: Emitter, event?: string, callback?: (info: EventInfo, data: DomEventData) => void): void;
}

export class SchemaContext {
  constructor(context: SchemaContextDefinition);

  get length(): number;

  get last(): any;

  [Symbol.iterator](): any;

  push(item: Node | Array<Node | string>): SchemaContext;

  getItem(index: number): any;

  getNames(): Generator<string, void, any>;

  endsWith(query: string): boolean;

  startsWith(query: string): boolean;
}

/**
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_model_schema-SchemaCompiledItemDefinition.html">Typedef SchemaCompiledItemDefinition (engine/model/schema~SchemaCompiledItemDefinition) - CKEditor 5 API docs</a>
 */
export type SchemaCompiledItemDefinition = {
  name?: string,

  allowIn?: string | string[],
  allowAttributes?: string | string[],

  isBlock?: boolean,
  isContent?: boolean,
  isInline?: boolean,
  isLimit?: boolean,
  isObject?: boolean,
  isSelectable?: boolean,
};

/**
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_model_schema-SchemaItemDefinition.html">Typedef SchemaItemDefinition (engine/model/schema~SchemaItemDefinition) - CKEditor 5 API docs</a>
 */
export type SchemaItemDefinition = {
  allowIn?: string | string[],
  allowAttributes?: string | string[],
  allowContentOf?: string | string[],
  allowWhere?: string | string[],
  allowAttributesOf?: string | string[],

  inheritTypesFrom?: string | string[],
  inheritAllFrom?: string,

  isBlock?: boolean,
  isContent?: boolean,
  isInline?: boolean,
  isLimit?: boolean,
  isObject?: boolean,
  isSelectable?: boolean,
};

export type SchemaContextDefinition = Node | Position | SchemaContext | string | Array<string | Node>;

/**
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_model_schema-AttributeProperties.html">Typedef AttributeProperties (engine/model/schema~AttributeProperties) - CKEditor 5 API docs</a>
 */
export type AttributeProperties = {
  copyOnEnter: boolean,
  isFormatting: boolean,
};

/**
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_model_schema-SchemaContextItem.html">Typedef SchemaContextItem (engine/model/schema~SchemaContextItem) - CKEditor 5 API docs</a>
 */
export type SchemaContextItem = {
  name: string,
  getAttribute: (keyName: string) => string;
};
