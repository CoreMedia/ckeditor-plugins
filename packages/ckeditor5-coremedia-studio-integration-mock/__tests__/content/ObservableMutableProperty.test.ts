import { observeMutableProperty } from "../../src/content/ObservableMutableProperty";
import Delayed from "../../src/content/Delayed";
import { testShouldRetrieveValues } from "./ObservableTestUtil";

describe("ObservableMutableProperty", () => {
  describe.each`
    initialDelayMs | changeDelayMs
    ${0}           | ${1}
    ${1}           | ${42}
  `(
    "[$#] Should just complete on no value, no matter of scheduling: initialDelayMs=$initialDelayMs, changeDelayMs=$changeDelayMs",
    ({ initialDelayMs, changeDelayMs }) => {
      const delays: Delayed = { initialDelayMs, changeDelayMs };
      const values: string[] = [];

      const observable = observeMutableProperty(delays, values);

      testShouldRetrieveValues(observable, values);
    }
  );

  describe.each`
    initialDelayMs | changeDelayMs
    ${0}           | ${1}
    ${1}           | ${42}
  `(
    "[$#] Should provide single value and complete, no matter of scheduling: initialDelayMs=$initialDelayMs, changeDelayMs=$changeDelayMs",
    ({ initialDelayMs, changeDelayMs }) => {
      const delays: Delayed = { initialDelayMs, changeDelayMs };
      const values: string[] = ["Lorem"];

      const observable = observeMutableProperty(delays, values);

      testShouldRetrieveValues(observable, values);
    }
  );

  describe.each`
    values
    ${[]}
    ${["Lorem"]}
    ${["Lorem", "ipsum"]}
    ${["Lorem", "ipsum", "dolor"]}
  `("[$#] Should provide all values: $values", ({ values }) => {
    // changeDelayMs: Trigger to iterate only once.
    const delays: Delayed = { initialDelayMs: 0, changeDelayMs: 0 };

    const observable = observeMutableProperty(delays, values);

    testShouldRetrieveValues(observable, values);
  });

  describe.each`
    values
    ${["Lorem", "ipsum"]}
    ${["Lorem", "ipsum", "dolor"]}
  `("[$#] Should loop values: $values", ({ values }) => {
    const delays: Delayed = { initialDelayMs: 0, changeDelayMs: 1 };
    // Add one more element from top, to see it looping.
    const expectedValues: string[] = [...values, ...values.slice(0, 1)];

    const observable = observeMutableProperty(delays, values);

    testShouldRetrieveValues(observable, expectedValues);
  });
});
