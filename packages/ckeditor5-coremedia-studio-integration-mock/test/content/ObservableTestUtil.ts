import type { Observable } from "rxjs";
import { lastValueFrom } from "rxjs";
import { take } from "rxjs/operators";

/**
 * @param observable - observable under test
 */
export const retrieveValuesUntilComplete = async <T>(observable: Observable<T>) => {
  const retrievedValues: T[] = [];

  const subscription = observable.subscribe({
    next: (value) => {
      retrievedValues.push(value);
    },
  });
  await lastValueFrom(observable);
  subscription.unsubscribe();
  return retrievedValues;
};

/**
 * @param observable - observable to validate
 * @param expectedValues - values to expect
 */
export const retrieveValues = async <T>(observable: Observable<T>, expectedValues: T[]) => {
  const limitedObservable = observable.pipe(take(expectedValues.length));
  return expectedValues.length > 0 ? retrieveValuesUntilComplete(limitedObservable) : [];
};
