import waitForExpect from "wait-for-expect";

type Expectation = () => void | Promise<void>;

export const extendingWaitForExpect = async (
  matcherName: string,
  expectation: Expectation,
  expected: unknown,
  actual: unknown | Promise<unknown>,
  utils: jest.MatcherUtils
): Promise<jest.CustomMatcherResult> => {
  const { isNot, promise } = utils;
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
          const receivedHint = utils.utils.printReceived(resolvedActual);
          const expectedHint = utils.utils.printExpected(expected);
          return utils.utils.matcherHint(matcherName, receivedHint, `not ${expectedHint}`, options);
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
          const receivedHint = utils.utils.printReceived(resolvedActual);
          const expectedHint = utils.utils.printExpected(expected);
          const hint = utils.utils.matcherHint(matcherName, receivedHint, `${expectedHint}`, options);
          return `${hint}\n<reason>${reason}</reason>`;
        },
        pass: false,
      };
    }
  };
  return waitForExpect(expectation).then(onPass).catch(onFailure);
};
