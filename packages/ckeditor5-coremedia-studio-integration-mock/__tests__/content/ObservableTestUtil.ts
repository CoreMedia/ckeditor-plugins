import { Observable } from "rxjs";
import { take } from "rxjs/operators";

/**
 * Assertions to run when done.
 */
export type ObservableAssertions<T> = (actual: T[]) => void;

/**
 * Tests the given observable and hands over the retrieved values
 * to the assertions after `complete`. Note, that if your observable
 * does not `complete` you must limit the value retrieval for example by
 * `observable.pipe(take(42))`.
 *
 * The method wraps the assertion into a JEST test, so that the `DoneCallback`
 * can be used. As such, you must not use this method within `test` or `it`
 * but `describe` instead.
 *
 * @param name - name of the test
 * @param observable - observable under test
 * @param assertions - assertions to apply on retrieved values when `complete`
 */
export const testShouldRetrieveValuesThat = <T>(
  name: string,
  observable: Observable<T>,
  assertions: ObservableAssertions<T>
) => {
  const retrievedValues: T[] = [];

  expect.hasAssertions();

  test(name, (done) => {
    observable.subscribe({
      next: (value) => {
        retrievedValues.push(value);
      },
      error: (error) => done(error),
      complete: () => {
        assertions(retrievedValues);
        done();
      },
    });
  });
};

/**
 * Tests to expect retrieving given values from observable.
 *
 * The subscription is automatically limited to the number of expected values.
 *
 * The method wraps the assertion into a JEST test, so that the `DoneCallback`
 * can be used. As such, you must not use this method within `test` or `it`
 * but `describe` instead.
 *
 * @param observable - observable to validate
 * @param expectedValues - values to expect
 */
export const testShouldRetrieveValues = <T>(observable: Observable<T>, expectedValues: T[]): void => {
  const name = `Should retrieve values: ${JSON.stringify(expectedValues)}`;
  const limitedObservable = observable.pipe(take(expectedValues.length));
  testShouldRetrieveValuesThat(name, limitedObservable, (retrievedValues) => {
    expect(retrievedValues).toStrictEqual(expectedValues);
  });
};
