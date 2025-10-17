import test, { describe } from "node:test";
import expect from "expect";
import { observeMutableProperty } from "../../src/content/ObservableMutableProperty";
import type Delayed from "../../src/content/Delayed";
import { retrieveValues } from "./ObservableTestUtil";

void describe("ObservableMutableProperty", () => {
  const testCases = [
    { initialDelayMs: 0, changeDelayMs: 1 },
    { initialDelayMs: 1, changeDelayMs: 42 },
  ];

  void describe("observeMutableProperty() with no values", () => {
    for (const [i, { initialDelayMs, changeDelayMs }] of testCases.entries()) {
      void test(`[${i}] Should just complete on no value, no matter of scheduling: initialDelayMs=${initialDelayMs}, changeDelayMs=${changeDelayMs}`, async () => {
        const delays: Delayed = { initialDelayMs, changeDelayMs };
        const values: string[] = [];

        const observable = observeMutableProperty(delays, values);
        expect(await retrieveValues(observable, values)).toStrictEqual(values);
      });
    }
  });

  const testCases2 = [
    { initialDelayMs: 0, changeDelayMs: 1 },
    { initialDelayMs: 1, changeDelayMs: 42 },
  ];

  void describe("observeMutableProperty() with single value", () => {
    for (const [i, { initialDelayMs, changeDelayMs }] of testCases2.entries()) {
      void test(`[${i}] Should provide single value and complete, no matter of scheduling: initialDelayMs=${initialDelayMs}, changeDelayMs=${changeDelayMs}`, async () => {
        const delays: Delayed = { initialDelayMs, changeDelayMs };
        const values: string[] = ["Lorem"];

        const observable = observeMutableProperty(delays, values);
        expect(await retrieveValues(observable, values)).toStrictEqual(values);
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
      void test(`[${i}] Should provide all values: ${JSON.stringify(values)}`, async () => {
        // changeDelayMs: Trigger to iterate only once.
        const delays: Delayed = { initialDelayMs: 0, changeDelayMs: 0 };

        const observable = observeMutableProperty(delays, values, 2);
        expect(await retrieveValues(observable, values)).toStrictEqual(values);
      });
    }
  });

  const testCases4 = [{ values: ["Lorem", "ipsum"] }, { values: ["Lorem", "ipsum", "dolor"] }];

  void describe("observeMutableProperty() looping", () => {
    for (const [i, { values }] of testCases4.entries()) {
      void test(`[${i}] Should loop values: ${JSON.stringify(values)}`, async () => {
        const delays: Delayed = { initialDelayMs: 0, changeDelayMs: 1 };
        // Add one more element from top, to see it looping.
        const expectedValues: string[] = [...values, ...values.slice(0, 1)];

        const observable = observeMutableProperty(delays, values, 3);
        expect(await retrieveValues(observable, expectedValues)).toStrictEqual(expectedValues);
      });
    }
  });
});
