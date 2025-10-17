import test, { describe } from "node:test";
import expect from "expect";
import type { MutableProperties, MutablePropertiesConfig } from "../../src/content/MutableProperties";
import {
  observeEditing,
  observeName,
  observeReadable,
  withPropertiesDefaults,
} from "../../src/content/MutableProperties";
import type Delayed from "../../src/content/Delayed";
import { retrieveValues } from "./ObservableTestUtil";

void describe("MutableProperties", () => {
  void describe("withPropertiesDefaults", () => {
    void test("Should provide defaults for empty config", () => {
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

    void describe("withPropertiesDefaults()", () => {
      for (const [i, data] of testCases.entries()) {
        void test(`[${i}] Should respect name value: ${JSON.stringify(data.name)}`, () => {
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

    void describe("withPropertiesDefaults()", () => {
      for (const [i, data] of testCases2.entries()) {
        void test(`[${i}] Should respect editing value: ${JSON.stringify(data.editing)}`, () => {
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

    void describe("withPropertiesDefaults()", () => {
      for (const [i, data] of testCases3.entries()) {
        void test(`[${i}] Should respect readable value: ${JSON.stringify(data.readable)}`, () => {
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

    void describe("withPropertiesDefaults()", () => {
      for (const [i, data] of testCases4.entries()) {
        void test(`[${i}] Should respect blob value: ${JSON.stringify(data.blob)}`, () => {
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

  void describe("Observables", () => {
    void describe("observeName", () => {
      type NameConfig = Delayed & Pick<MutableProperties, "name">;

      void describe("Should provide single name and complete", async () => {
        const values = ["Lorem"];
        const config: NameConfig = {
          initialDelayMs: 0,
          changeDelayMs: 1,
          name: values,
        };
        const observable = observeName(config);
        await test(async () => expect(await retrieveValues(observable, values)).toStrictEqual(values));
      });

      void describe("Should just complete for no names to provide", async () => {
        const values: string[] = [];
        const config: NameConfig = {
          initialDelayMs: 0,
          changeDelayMs: 1,
          name: values,
        };
        const observable = observeName(config);
        await test(async () => expect(await retrieveValues(observable, values)).toStrictEqual(values));
      });

      void describe("Should provide names and restart", async () => {
        const values = ["Lorem", "Ipsum"];
        const config: NameConfig = {
          initialDelayMs: 0,
          changeDelayMs: 1,
          name: values,
        };
        const expectedValues = [...values, ...values.slice(0, 1)];
        // We only take values from first iteration, and the first of
        // the second, to see looping behavior.
        const observable = observeName(config, 2);
        await test(async () => expect(await retrieveValues(observable, expectedValues)).toStrictEqual(expectedValues));
      });

      void describe("observeEditing", async () => {
        type EditingConfig = Delayed & Pick<MutableProperties, "editing">;

        const testCases = [{ value: true }, { value: false }];

        for (const [i, { value }] of testCases.entries()) {
          const values = [value];
          const config: EditingConfig = {
            initialDelayMs: 0,
            changeDelayMs: 1,
            editing: values,
          };

          const observable = observeEditing(config);

          await test(`[${i}] Should provide single value '${value}' and complete`, async () =>
            expect(await retrieveValues(observable, values)).toStrictEqual(values));
        }

        void describe("Should just complete for no values to provide", async () => {
          const values: boolean[] = [];
          const config: EditingConfig = {
            initialDelayMs: 0,
            changeDelayMs: 1,
            editing: values,
          };

          const observable = observeEditing(config);

          await test(async () => expect(await retrieveValues(observable, values)).toStrictEqual(values));
        });

        void describe("Should provide values and restart", async () => {
          const values = [true, false];
          const config: EditingConfig = {
            initialDelayMs: 0,
            changeDelayMs: 1,
            editing: values,
          };
          const expectedValues = [...values, ...values.slice(0, 1)];

          const observable = observeEditing(config, 2);

          await test(async () =>
            expect(await retrieveValues(observable, expectedValues)).toStrictEqual(expectedValues),
          );
        });
      });

      void describe("observeReadable", () => {
        type ReadableConfig = Delayed & Pick<MutableProperties, "readable">;

        const testCases = [{ value: true }, { value: false }];

        void describe("observeReadable()", () => {
          for (const [i, { value }] of testCases.entries()) {
            const values = [value];
            const config: ReadableConfig = {
              initialDelayMs: 0,
              changeDelayMs: 1,
              readable: values,
            };
            const observable = observeReadable(config);

            void test(`[${i}] Should provide single value '${value}' and complete`, async () =>
              expect(await retrieveValues(observable, values)).toStrictEqual(values));
          }
        });

        void describe("Should just complete for no values to provide", () => {
          const values: boolean[] = [];
          const config: ReadableConfig = {
            initialDelayMs: 0,
            changeDelayMs: 1,
            readable: values,
          };
          const observable = observeReadable(config);

          void test(async () => expect(await retrieveValues(observable, values)).toStrictEqual(values));
        });

        void describe("Should provide values and restart", () => {
          const values = [true, false];
          const config: ReadableConfig = {
            initialDelayMs: 0,
            changeDelayMs: 1,
            readable: values,
          };
          const expectedValues = [...values, ...values.slice(0, 1)];

          const observable = observeReadable(config, 2);

          void test(async () => expect(await retrieveValues(observable, expectedValues)).toStrictEqual(expectedValues));
        });
      });
    });
  });
});
