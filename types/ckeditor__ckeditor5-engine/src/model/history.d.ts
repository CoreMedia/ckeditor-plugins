import Operation from "./operation/operation";

/**
 * `History` keeps the track of all the operations applied to the {@link module:engine/model/document~Document document}.
 *
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_model_history-History.html">Class History (engine/model/history~History) - CKEditor 5 API docs</a>
 */
export default class History {
  constructor();

  addOperation(operation: Operation): void;

  getOperation(baseVersion: number): Operation | undefined;

  getOperations(from?: number, to?: number): Operation[];

  getUndoneOperation(undoingOperation: Operation): Operation | undefined;

  isUndoingOperation(operation: Operation): boolean;

  isUndoneOperation(operation: Operation): boolean;

  setOperationAsUndone(undoneOperation: Operation, undoingOperation: Operation): void;
}
