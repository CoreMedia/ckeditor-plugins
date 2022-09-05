import Delayed from "./Delayed";
import { AtomicOrArray, increaseUpToAndRestart } from "./MockContentUtils";
import { Observable, Subscriber, TeardownLogic } from "rxjs";
import { Subscription } from "./RxJsConvenience";

/**
 * Provides a subscription on an endlessly changing property. If just one
 * value is given, this value will be provided once and subscription is
 * then completed. For more than one value, the list of values is iterated
 * through, and at the end started again from the beginning.
 */
class MutablePropertyObservationHandler<T> {
  /**
   * The initial delay before the first value is delivered. A special value
   * `< 1` will trigger immediate serve of the first value.
   */
  readonly #initialDelayMs: number;
  /**
   * Delay for next values after the first provided one. Only relevant for
   * more than one value.
   */
  readonly #changeDelayMs: number;
  /**
   * The values to reach.
   */
  readonly #values: T[];
  /**
   * Remember length of values.
   */
  readonly #valuesLength: number;
  /**
   * Signals, if there is any value present (thus, `true` implies `valueLength > 0`).
   */
  readonly #anyValue: boolean;
  /**
   * Signals, if there is more than one value present, i.e., if we shall loop
   * or not. Implies `valueLength > 1`.
   */
  readonly #iterating: boolean;
  /**
   * Signals, if values should only be processed once. Typically, only `true`
   * when there is just one value to provide.
   *
   * For testing purpose, single iteration is also performed, when
   * `changeDelayMs < 1`.
   */
  readonly #iterateOnlyOnce: boolean;

  /**
   * Constructor.
   *
   * @param delays - delays in milliseconds to apply
   * @param property - property values to possibly iterate
   */
  constructor(delays: Delayed, property: AtomicOrArray<T>) {
    const { initialDelayMs, changeDelayMs } = delays;
    this.#values = ([] as T[]).concat(property);

    // Some convenience on-before calculation.
    this.#valuesLength = this.#values.length;
    this.#anyValue = this.#valuesLength > 0;
    this.#iterating = this.#valuesLength > 1;
    this.#initialDelayMs = Math.max(initialDelayMs, 0);
    // Change delay for scheduling must not be less than 1 millisecond.
    this.#changeDelayMs = Math.max(changeDelayMs, 1);
    // Nevertheless, a change delay of 0 or less is meant for testing purpose
    // to trigger only one iteration through all values.
    this.#iterateOnlyOnce = changeDelayMs < 1 || this.#valuesLength < 2;
  }

  /**
   * Subscription strategy.
   *
   * @param subscriber - will receive the provided values or completed-state
   * @returns a handler to stop iterating when subscription is ended
   */
  readonly #iteratingSubscription = (subscriber: Subscriber<T>): TeardownLogic => {
    const values = this.#values;
    const valuesLength = this.#valuesLength;
    const anyValue = this.#anyValue;
    const iterateOnlyOnce = this.#iterateOnlyOnce;
    const initialDelayMs = this.#initialDelayMs;
    const changeDelayMs = this.#changeDelayMs;

    let idxCurrentValue = 0;
    // Timer ID to unsubscribe.
    let timerId: number | undefined;

    // Nested Timeout: https://javascript.info/settimeout-setinterval#nested-settimeout
    const handler = (): number | void => {
      if (anyValue) {
        // There is at least one value, so let's provide it.
        const nextValue = values[idxCurrentValue];
        subscriber.next(nextValue);
      }

      // Trigger loop. Side note: Will return unchanged for singleton values.
      const { value: newIndex, restart } = increaseUpToAndRestart(idxCurrentValue, valuesLength);
      idxCurrentValue = newIndex;

      // Test-scenario: Stop once we iterated through all values for change delay less than 1.
      // Single/No Value: Stop if there was only one or none value to provide.
      if (restart && iterateOnlyOnce) {
        // As we don't retrieve the service with `{ fixed: true }` we must not
        // send `complete()` here, as otherwise the service agent will create
        // a new observable automatically.
        //
        // Tests need to ensure, to trigger completion on their own, for
        // example by limiting the retrieved values via `take(number)` operator.
        return;
      }

      // Start looping.
      timerId = setTimeout(handler, changeDelayMs);
      // Required for immediate call.
      return timerId;
    };

    // Will first respect initialDelay, while using changeDelay later.
    if (initialDelayMs < 1) {
      timerId = handler() || undefined;
    } else {
      timerId = setTimeout(handler, initialDelayMs);
    }

    return () => {
      // Does nothing, if timerId is undefined.
      // see https://developer.mozilla.org/en-US/docs/Web/API/clearTimeout#notes
      clearTimeout(timerId);
    };
  };

  /**
   * Provides a subscription to be used by RxJS based on the
   * initial configuration.
   */
  get subscription(): Subscription<T> {
    return this.#iteratingSubscription;
  }
}

/**
 * An observable providing values over time. Will complete on first provided
 * value, if there is only one value given.
 *
 * For testing purpose, the only other way to complete a subscription is to
 * provide a change delay less than 1 (one). Then, the values will only
 * be provided once. In all other cases, provided values will loop over time
 * until subscription ends.
 */
class ObservableMutableProperty<T> extends Observable<T> {
  constructor(delays: Delayed, property: AtomicOrArray<T>) {
    super(new MutablePropertyObservationHandler(delays, property).subscription);
  }
}

const observeMutableProperty = <T>(delays: Delayed, property: AtomicOrArray<T>): Observable<T> => {
  return new ObservableMutableProperty<T>(delays, property);
};

export default ObservableMutableProperty;
export { observeMutableProperty, MutablePropertyObservationHandler };
