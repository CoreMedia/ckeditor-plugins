import { Observable } from "rxjs";
import { take } from "rxjs/operators";

/**
 * Assertions to run when done.
 */
export interface ObservableAssertions<T> {
  (actual: T[], expected: T[]): void;
}

/**
 * The default assertion to apply, which is a strict equals check on the arrays.
 *
 * @param actual - actual values retrieved
 * @param expected - expected values
 */
const defaultAssertions: ObservableAssertions<unknown> = (actual, expected) => {
  expect(actual).toHaveLength(expected.length);
  expect(actual).toStrictEqual(expected);
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
 * @param assertions - assertions to apply; defaults to strict equals
 */
export const testShouldRetrieveValues = <T>(
  observable: Observable<T>,
  expectedValues: T[],
  assertions: ObservableAssertions<T> = defaultAssertions
): void => {
  const retrievedValues: T[] = [];

  expect.hasAssertions();

  test(`Should retrieve values: ${JSON.stringify(expectedValues)}`, (done) => {
    observable.pipe(take(expectedValues.length)).subscribe({
      next: (value) => {
        retrievedValues.push(value);
      },
      error: (error) => done(error),
      complete: () => {
        assertions(retrievedValues, expectedValues);
        done();
      },
    });
  });
};
