import Emitter from "./emittermixin";
import { PriorityString } from "./priorities";

export type BindReturnValue = {
  to: Function;
  toMany: Function;
};

/**
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_utils_observablemixin-Observable.html">Interface Observable (utils/observablemixin~Observable) - CKEditor 5 API docs</a>
 */
export default interface Observable extends Emitter {
  bind(...bindProperties: any[]): BindReturnValue;

  decorate(methodName: string): void;

  set(name: string | Object, value?: any): void;
}
