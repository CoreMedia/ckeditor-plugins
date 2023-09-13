import waitForExpect from "wait-for-expect";

export type Expectation = () => void | Promise<void>;

/**
 * Utility method to extend Jest matchers by asynchronous wait for UI state
 * events.
 *
 * @param matcherName - name of the matcher to implement like `toBeVisible`
 * @param expectation - the expectation, i.e., a call to `expect` which will be
 * repeated until fulfilled or timeout
 * @param negatedExpectation - the negated expectation, used when the matcher is
 * called with `not` such as `expect(value).not.toCustomMatch()`.
 * @param context - Jest Matcher Context represented by `this` when extending matchers
 */
export const extendingWaitForExpect = async (
  matcherName: string,
  expectation: Expectation,
  negatedExpectation: Expectation,
  context: jest.MatcherContext,
): Promise<jest.CustomMatcherResult> => {
  const { isNot } = context;
  if (isNot) {
    // We need some inverse logic, a passed negated expectation will be marked
    // as `pass: false` as this is, what `expect().not` expects for successful
    // negation.
    return waitForExpect(negatedExpectation)
      .then(() => ({
        message: () => `not ${matcherName}: irrelevant message for passed negated expectation`,
        pass: false,
      }))
      .catch((reason) => ({
        message: () => `not ${matcherName}: ${reason}`,
        pass: true,
      }));
  } else {
    return waitForExpect(expectation)
      .then(() => ({
        message: () => `${matcherName}: irrelevant message for passed expectation`,
        pass: true,
      }))
      .catch((reason) => ({
        message: () => `${matcherName}: ${reason}`,
        pass: false,
      }));
  }
};
