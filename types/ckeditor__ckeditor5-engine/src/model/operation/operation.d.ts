import Document from "../document";

/**
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_model_operation_operation-Operation.html">Class Operation (engine/model/operation/operation~Operation) - CKEditor 5 API docs</a>
 */
export default class Operation {
  constructor(baseVersion: number | null);

  toJSON(): Object;

  static get className(): string;

  static fromJSON(json: Object, document: Document): Operation;
}
