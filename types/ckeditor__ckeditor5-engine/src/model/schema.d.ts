import Emitter from "@ckeditor/ckeditor5-utils/src/emittermixin";
import Observable, { BindReturnValue } from "@ckeditor/ckeditor5-utils/src/observablemixin";
import { PriorityString } from "@ckeditor/ckeditor5-utils/src/priorities";

/**
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_model_schema-SchemaItemDefinition.html">Typedef SchemaItemDefinition (engine/model/schema~SchemaItemDefinition) - CKEditor 5 API docs</a>
 */
export type SchemaItemDefinition = {
  allowAttributes?: string | string[],
  allowAttributesOf?: string | string[],
  allowContentOf?: string | string[],
  allowIn?: string | string[],
  allowWhere?: string | string[],
  inheritAllFrom?: string,
  inheritTypesFrom?: string | string[],
  isBlock?: boolean,
  isContent?: boolean,
  isInline?: boolean,
  isLimit?: boolean,
  isObject?: boolean,
  isSelectable?: boolean,
};

/**
 * The model's schema. It defines allowed and disallowed structures of nodes as well as nodes' attributes.
 *
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_model_schema-Schema.html">Class Schema (engine/model/schema~Schema) - CKEditor 5 API docs</a>
 */
export default class Schema implements Emitter, Observable {
  constructor();
  register(itemName: string, definition: SchemaItemDefinition): void;
  extend(itemName: string, definition: SchemaItemDefinition): void;

  bind(...bindProperties: any[]): BindReturnValue;

  on(event: string, callback: Function, options?: { priority: PriorityString | number }): void;

  once(event: string, callback: Function, options?: { priority: PriorityString | number }): void;

  set(name: string | Object, value?: any): void;
}
