import { Subscriber, TeardownLogic } from "rxjs";

/**
 * Interface for an RxJS subscription method.
 */
interface Subscription<T> {
  (subscriber: Subscriber<T>): TeardownLogic;
}

export { Subscription };
