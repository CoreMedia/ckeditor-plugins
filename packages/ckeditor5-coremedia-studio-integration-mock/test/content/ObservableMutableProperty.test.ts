import "global-jsdom/register";
import test, { describe } from "node:test";
import { observeMutableProperty } from "../../src/content/ObservableMutableProperty";
import Delayed from "../../src/content/Delayed";
import { testShouldRetrieveValues } from "./ObservableTestUtil";

void describe("ObservableMutableProperty", () => {
  const testCases = [
    { initialDelayMs: 0, changeDelayMs: 1 },
    { initialDelayMs: 1, changeDelayMs: 42 },
  ];

  void describe("observeMutableProperty() with no values", () => {
    for (const [i, { initialDelayMs, changeDelayMs }] of testCases.entries()) {
      void test(`[${i}] Should just complete on no value, no matter of scheduling: initialDelayMs=${initialDelayMs}, changeDelayMs=${changeDelayMs}`, () => {
        const delays: Delayed = { initialDelayMs, changeDelayMs };
        const values: string[] = [];

        const observable = observeMutableProperty(delays, values);

        testShouldRetrieveValues(observable, values);
      });
    }
  });

  const testCases2 = [
    { initialDelayMs: 0, changeDelayMs: 1 },
    { initialDelayMs: 1, changeDelayMs: 42 },
  ];

  void describe("observeMutableProperty() with single value", () => {
    for (const [i, { initialDelayMs, changeDelayMs }] of testCases2.entries()) {
      void test(`[${i}] Should provide single value and complete, no matter of scheduling: initialDelayMs=${initialDelayMs}, changeDelayMs=${changeDelayMs}`, () => {
        const delays: Delayed = { initialDelayMs, changeDelayMs };
        const values: string[] = ["Lorem"];

        const observable = observeMutableProperty(delays, values);

        testShouldRetrieveValues(observable, values);
      });
    }
  });

  const testCases3 = [
    { values: [] },
    { values: ["Lorem"] },
    { values: ["Lorem", "ipsum"] },
    { values: ["Lorem", "ipsum", "dolor"] },
  ];

  void describe("observeMutableProperty() with multiple values", () => {
    for (const [i, { values }] of testCases3.entries()) {
      void test(`[${i}] Should provide all values: ${JSON.stringify(values)}`, () => {
        // changeDelayMs: Trigger to iterate only once.
        const delays: Delayed = { initialDelayMs: 0, changeDelayMs: 0 };

        const observable = observeMutableProperty(delays, values);

        testShouldRetrieveValues(observable, values);
      });
    }
  });

  const testCases4 = [{ values: ["Lorem", "ipsum"] }, { values: ["Lorem", "ipsum", "dolor"] }];

  void describe("observeMutableProperty() looping", () => {
    for (const [i, { values }] of testCases4.entries()) {
      void test(`[${i}] Should loop values: ${JSON.stringify(values)}`, () => {
        const delays: Delayed = { initialDelayMs: 0, changeDelayMs: 1 };
        // Add one more element from top, to see it looping.
        const expectedValues: string[] = [...values, ...values.slice(0, 1)];

        const observable = observeMutableProperty(delays, values);

        testShouldRetrieveValues(observable, expectedValues);
      });
    }
  });
});
