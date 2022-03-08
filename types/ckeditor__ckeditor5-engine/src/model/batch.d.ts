import Operation from "./operation/operation";

/**
 * A batch instance groups model changes ({@link module:engine/model/operation/operation~Operation operations}).
 *
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_model_batch-Batch.html">Class Batch (engine/model/batch~Batch) - CKEditor 5 API docs</a>
 */
export default class Batch {
  constructor(type?: { isUndo?: boolean, isUndoable?: boolean, isLocal?: boolean, isTyping?: boolean });

  readonly operations: Array<Operation>;
  readonly isLocal: boolean;
  readonly isTyping: boolean;
  readonly isUndo: boolean;
  readonly isUndoable: boolean;

  get baseVersion(): number | null;

  addOperation<T = Operation>(operation: T): T;
}
