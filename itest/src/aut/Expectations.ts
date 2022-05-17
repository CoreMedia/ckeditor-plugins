import waitForExpect from "wait-for-expect";

type Expectation = () => void | Promise<void>;

/**
 * Utility method to extend Jest matchers by asynchronous wait for UI state
 * events. Based on `wait-for-expect` it may not be the optimal solution. For
 * example, the actual value, if evaluated dynamically, may be different to
 * the actual value retrieved while evaluating the expectation.
 *
 * A better approach may be provided by providing a custom wait pattern, which
 * stores the state in between.
 *
 * @param matcherName - name of the matcher to implement like `toBeVisible`
 * @param expectation - the expectation, i.e., a call to `expect` which will be
 * repeated until fulfilled or timeout
 * @param expected - failure display: describes the expected state to reach by expectation (will be prefixed with _not_ if negated)
 * @param actual - failure display: description of the actual state reached by the AUT
 * @param context - Jest Matcher Context represented by `this` when extending matchers
 */
export const extendingWaitForExpect = async (
  matcherName: string,
  expectation: Expectation,
  expected: unknown,
  actual: unknown | Promise<unknown>,
  context: jest.MatcherContext
): Promise<jest.CustomMatcherResult> => {
  const { isNot, promise, utils } = context;
  const options: jest.MatcherHintOptions = {
    comment: "wait for expectation to fulfill",
    isNot,
    promise,
  };
  const onPass = async (): Promise<jest.CustomMatcherResult> => {
    if (isNot) {
      const resolvedActual = await Promise.resolve(actual);
      return {
        message: () => {
          const receivedHint = utils.printReceived(resolvedActual);
          const expectedHint = utils.printExpected(expected);
          return utils.matcherHint(matcherName, receivedHint, `not ${expectedHint}`, options);
        },
        pass: true,
      };
    } else {
      // No extra effort to get actual value.
      return {
        message: () => "",
        pass: true,
      };
    }
  };
  const onFailure = async (reason: unknown): Promise<jest.CustomMatcherResult> => {
    if (isNot) {
      // No extra effort to get actual value.
      return {
        message: () => "",
        pass: false,
      };
    } else {
      const resolvedActual = await Promise.resolve(actual);
      return {
        message: () => {
          const receivedHint = utils.printReceived(resolvedActual);
          const expectedHint = utils.printExpected(expected);
          const hint = utils.matcherHint(matcherName, receivedHint, `${expectedHint}`, options);
          // As we have hidden the failure of the expectation for now, we will now expose it.
          return `${hint}\n<reason>${reason}</reason>`;
        },
        pass: false,
      };
    }
  };
  return waitForExpect(expectation).then(onPass).catch(onFailure);
};
