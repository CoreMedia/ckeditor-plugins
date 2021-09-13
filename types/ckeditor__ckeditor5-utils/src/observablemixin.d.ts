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

export interface BindChain {
  to<O1 extends Observable, K1 extends keyof O1>(
    observable1: O1,
    key1?: K1,
    callback?: (value: O1[K1]) => unknown,
  ): void;
  to<O1 extends Observable, K1 extends keyof O1, O2 extends Observable, K2 extends keyof O2>(
    observable1: O1,
    key1: K1,
    observable2: O2,
    key2: K2,
    callback: (value1: O1[K1], value2: O2[K2]) => unknown,
  ): void;
  to<
    O1 extends Observable,
    K1 extends keyof O1,
    O2 extends Observable,
    K2 extends keyof O2,
    O3 extends Observable,
    K3 extends keyof O3,
    >(
    observable1: O1,
    key1: K1,
    observable2: O2,
    key2: K2,
    observable3: O3,
    key3: K3,
    callback: (value1: O1[K1], value2: O2[K2], value3: O3[K3]) => unknown,
  ): void;
  to<
    O1 extends Observable,
    K1 extends keyof O1,
    O2 extends Observable,
    K2 extends keyof O2,
    O3 extends Observable,
    K3 extends keyof O3,
    O4 extends Observable,
    K4 extends keyof O4,
    >(
    observable1: O1,
    key1: K1,
    observable2: O2,
    key2: K2,
    observable3: O3,
    key3: K3,
    observable4: O4,
    key4: K4,
    callback: (value1: O1[K1], value2: O2[K2], value3: O3[K3], value4: O4[K4]) => unknown,
  ): void;
  to<
    O1 extends Observable,
    K1 extends keyof O1,
    O2 extends Observable,
    K2 extends keyof O2,
    O3 extends Observable,
    K3 extends keyof O3,
    O4 extends Observable,
    K4 extends keyof O4,
    O5 extends Observable,
    K5 extends keyof O5,
    >(
    observable1: O1,
    key1: K1,
    observable2: O2,
    key2: K2,
    observable3: O3,
    key3: K3,
    observable4: O4,
    key4: K4,
    observable5: O5,
    key5: K5,
    callback: (value1: O1[K1], value2: O2[K2], value3: O3[K3], value4: O4[K4], value5: O5[K5]) => unknown,
  ): void;

  toMany<O extends Observable, K extends keyof O>(
    observables: O[],
    key: K,
    callback: (...values: Array<O[K]>) => void,
  ): void;
}
