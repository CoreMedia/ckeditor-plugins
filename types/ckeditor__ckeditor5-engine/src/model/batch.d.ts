import Operation from "./operation/operation";

/**
 * A batch instance groups model changes ({@link module:engine/model/operation/operation~Operation operations}).
 *
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_model_batch-Batch.html">Class Batch (engine/model/batch~Batch) - CKEditor 5 API docs</a>
 */
export default class Batch {
  constructor(type?: 'transparent' | 'default');

  readonly operations: Array<Operation>;
  readonly type: 'transparent' | 'default';

  get baseVersion(): number | null;

  addOperation<T = Operation>(operation: T): T;
}
