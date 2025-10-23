import type { Subscriber, TeardownLogic } from "rxjs";

/**
 * Interface for an RxJS subscription method.
 */
type Subscription<T> = (subscriber: Subscriber<T>) => TeardownLogic;

export type { Subscription };
