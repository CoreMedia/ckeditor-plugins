/* eslint no-null/no-null: off */

import "global-jsdom/register";
import test, { describe } from "node:test";
import expect from "expect";
import {
  MutableProperties,
  MutablePropertiesConfig,
  observeEditing,
  observeName,
  observeReadable,
  withPropertiesDefaults,
} from "../../src/content/MutableProperties";
import Delayed from "../../src/content/Delayed";
import { testShouldRetrieveValues } from "./ObservableTestUtil";

describe("MutableProperties", () => {
  describe("withPropertiesDefaults", () => {
    test("Should provide defaults for empty config", () => {
      const config: MutablePropertiesConfig = {};
      const result = withPropertiesDefaults(config);
      const {
        name: actualNames,
        editing: actualEditingStates,
        readable: actualReadableStates,
        blob: actualBlobValues,
      } = result;
      expect(actualNames).toHaveLength(1);
      expect(actualNames[0]).toMatch(/.+/);
      expect(actualEditingStates).toStrictEqual([false]);
      expect(actualReadableStates).toStrictEqual([true]);
      expect(actualBlobValues).toStrictEqual([null]);
    });

    const testCases = [
      { name: "", expected: [""] },
      { name: "Lorem", expected: ["Lorem"] },
      { name: [], expected: [] },
      { name: ["Lorem", "Ipsum"], expected: ["Lorem", "Ipsum"] },
      { name: ["Lorem", "Ipsum", "Sit"], expected: ["Lorem", "Ipsum", "Sit"] },
    ];

    describe("withPropertiesDefaults()", () => {
      for (const [i, data] of testCases.entries()) {
        test(`[${i}] Should respect name value: ${JSON.stringify(data.name)}`, () => {
          const { name, expected } = data;
          const config: MutablePropertiesConfig = { name };
          const result = withPropertiesDefaults(config);
          const {
            name: actualNames,
            editing: actualEditingStates,
            readable: actualReadableStates,
            blob: actualBlobValues,
          } = result;

          expect(actualNames).toStrictEqual(expected);
          expect(actualEditingStates).toStrictEqual([false]);
          expect(actualReadableStates).toStrictEqual([true]);
          expect(actualBlobValues).toStrictEqual([null]);
        });
      }
    });

    const testCases2 = [
      { editing: true, expected: [true] },
      { editing: false, expected: [false] },
      { editing: [], expected: [] },
      { editing: [false, true], expected: [false, true] },
    ];

    describe("withPropertiesDefaults()", () => {
      for (const [i, data] of testCases2.entries()) {
        test(`[${i}] Should respect editing value: ${JSON.stringify(data.editing)}`, () => {
          const { editing, expected } = data;
          const config: MutablePropertiesConfig = { editing };
          const result = withPropertiesDefaults(config);
          const {
            name: actualNames,
            editing: actualEditingStates,
            readable: actualReadableStates,
            blob: actualBlobValues,
          } = result;

          expect(actualNames).toHaveLength(1);
          expect(actualNames[0]).toMatch(/.+/);
          expect(actualEditingStates).toStrictEqual(expected);
          expect(actualReadableStates).toStrictEqual([true]);
          expect(actualBlobValues).toStrictEqual([null]);
        });
      }
    });

    const testCases3 = [
      { readable: true, expected: [true] },
      { readable: false, expected: [false] },
      { readable: [], expected: [] },
      { readable: [false, true], expected: [false, true] },
    ];

    describe("withPropertiesDefaults()", () => {
      for (const [i, data] of testCases3.entries()) {
        test(`[${i}] Should respect readable value: ${JSON.stringify(data.readable)}`, () => {
          const { readable, expected } = data;
          const config: MutablePropertiesConfig = { readable };
          const result = withPropertiesDefaults(config);
          const {
            name: actualNames,
            editing: actualEditingStates,
            readable: actualReadableStates,
            blob: actualBlobValues,
          } = result;

          expect(actualNames).toHaveLength(1);
          expect(actualNames[0]).toMatch(/.+/);
          expect(actualEditingStates).toStrictEqual([false]);
          expect(actualReadableStates).toStrictEqual(expected);
          expect(actualBlobValues).toStrictEqual([null]);
        });
      }
    });

    const testCases4 = [
      {
        blob: [null],
        expected: [null],
      },
      {
        blob: null,
        expected: [null],
      },
      {
        blob: [],
        expected: [],
      },
      {
        blob: "data:image/png;base64,theData",
        expected: [{ value: "data:image/png;base64,theData", mime: "image/png" }],
      },
      {
        blob: ["data:image/png;base64,firstData", "data:image/png;base64,secondData"],
        expected: [
          { value: "data:image/png;base64,firstData", mime: "image/png" },
          { value: "data:image/png;base64,secondData", mime: "image/png" },
        ],
      },
    ];

    describe("withPropertiesDefaults()", () => {
      for (const [i, data] of testCases4.entries()) {
        test(`[${i}] Should respect blob value: ${JSON.stringify(data.blob)}`, () => {
          const { blob, expected } = data;
          const config: MutablePropertiesConfig = { blob };
          const result = withPropertiesDefaults(config);
          const {
            name: actualNames,
            editing: actualEditingStates,
            readable: actualReadableStates,
            blob: actualBlobValues,
          } = result;

          expect(actualNames).toHaveLength(1);
          expect(actualNames[0]).toMatch(/.+/);
          expect(actualEditingStates).toStrictEqual([false]);
          expect(actualReadableStates).toStrictEqual([true]);
          expect(actualBlobValues).toStrictEqual(expected);
        });
      }
    });
  });

  describe("Observables", () => {
    describe("observeName", () => {
      type NameConfig = Delayed & Pick<MutableProperties, "name">;

      describe("Should provide single name and complete", () => {
        const values = ["Lorem"];
        const config: NameConfig = {
          initialDelayMs: 0,
          changeDelayMs: 1,
          name: values,
        };
        const observable = observeName(config);
        testShouldRetrieveValues(observable, values);
      });

      describe("Should just complete for no names to provide", () => {
        const values: string[] = [];
        const config: NameConfig = {
          initialDelayMs: 0,
          changeDelayMs: 1,
          name: values,
        };
        const observable = observeName(config);
        testShouldRetrieveValues(observable, values);
      });

      describe("Should provide names and restart", () => {
        const values = ["Lorem", "Ipsum"];
        const config: NameConfig = {
          initialDelayMs: 0,
          changeDelayMs: 1,
          name: values,
        };
        const expectedValues = [...values, ...values.slice(0, 1)];
        // We only take values from first iteration, and the first of
        // the second, to see looping behavior.
        const observable = observeName(config);
        testShouldRetrieveValues(observable, expectedValues);
      });
    });

    describe("observeEditing", () => {
      type EditingConfig = Delayed & Pick<MutableProperties, "editing">;

      const testCases = [{ value: true }, { value: false }];

      describe("observeEditing()", () => {
        for (const [i, { value }] of testCases.entries()) {
          test(`[${i}] Should provide single value '${value}' and complete`, () => {
            const values = [value];
            const config: EditingConfig = {
              initialDelayMs: 0,
              changeDelayMs: 1,
              editing: values,
            };

            const observable = observeEditing(config);

            testShouldRetrieveValues(observable, values);
          });
        }
      });

      describe("Should just complete for no values to provide", () => {
        const values: boolean[] = [];
        const config: EditingConfig = {
          initialDelayMs: 0,
          changeDelayMs: 1,
          editing: values,
        };

        const observable = observeEditing(config);

        testShouldRetrieveValues(observable, values);
      });

      describe("Should provide values and restart", () => {
        const values = [true, false];
        const config: EditingConfig = {
          initialDelayMs: 0,
          changeDelayMs: 1,
          editing: values,
        };
        const expectedValues = [...values, ...values.slice(0, 1)];

        const observable = observeEditing(config);

        testShouldRetrieveValues(observable, expectedValues);
      });
    });

    describe("observeReadable", () => {
      type ReadableConfig = Delayed & Pick<MutableProperties, "readable">;

      const testCases = [{ value: true }, { value: false }];

      describe("observeReadable()", () => {
        for (const [i, { value }] of testCases.entries()) {
          test(`[${i}] Should provide single value '${value}' and complete`, () => {
            const values = [value];
            const config: ReadableConfig = {
              initialDelayMs: 0,
              changeDelayMs: 1,
              readable: values,
            };
            const observable = observeReadable(config);

            testShouldRetrieveValues(observable, values);
          });
        }
      });

      describe("Should just complete for no values to provide", () => {
        const values: boolean[] = [];
        const config: ReadableConfig = {
          initialDelayMs: 0,
          changeDelayMs: 1,
          readable: values,
        };
        const observable = observeReadable(config);

        testShouldRetrieveValues(observable, values);
      });

      describe("Should provide values and restart", () => {
        const values = [true, false];
        const config: ReadableConfig = {
          initialDelayMs: 0,
          changeDelayMs: 1,
          readable: values,
        };
        const expectedValues = [...values, ...values.slice(0, 1)];

        const observable = observeReadable(config);

        testShouldRetrieveValues(observable, expectedValues);
      });
    });
  });
});
