import Operation from "./operation";
import Document from "../document";
import Range from "../range";

/**
 * Operation to change nodes' attribute.
 *
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_model_operation_attributeoperation-AttributeOperation.html">Class AttributeOperation (engine/model/operation/attributeoperation~AttributeOperation) - CKEditor 5 API docs</a>
 */
export default class AttributeOperation extends Operation {
  readonly key: string;

  readonly newValue: any | null;

  readonly oldValue: any | null;

  get type(): "addAttribute" | "removeAttribute" | "changeAttribute";

  readonly range: Range;

  constructor(range: Range, key: string, oldValue: any | null, newValue: any | null, baseVersion: number | null);

  clone(): AttributeOperation;

  getReversed(): AttributeOperation;

  static fromJSON(json: Object, document: Document): AttributeOperation;

  static get className(): string;

  toJSON(): any;
}
