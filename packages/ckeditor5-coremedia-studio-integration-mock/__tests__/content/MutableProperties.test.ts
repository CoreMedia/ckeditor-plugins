/* eslint no-null/no-null: off */

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

    test.each`
      name                         | expected
      ${""}                        | ${[""]}
      ${"Lorem"}                   | ${["Lorem"]}
      ${[]}                        | ${[]}
      ${["Lorem", "Ipsum"]}        | ${["Lorem", "Ipsum"]}
      ${["Lorem", "Ipsum", "Sit"]} | ${["Lorem", "Ipsum", "Sit"]}
    `("[$#] Should respect name value: $name", (data) => {
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

    test.each`
      editing          | expected
      ${true}          | ${[true]}
      ${false}         | ${[false]}
      ${[]}            | ${[]}
      ${[false, true]} | ${[false, true]}
    `("[$#] Should respect editing value: $editing", (data) => {
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

    test.each`
      readable         | expected
      ${true}          | ${[true]}
      ${false}         | ${[false]}
      ${[]}            | ${[]}
      ${[false, true]} | ${[false, true]}
    `("[$#] Should respect readable value: $editing", (data) => {
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

    test.each`
      blob                                                                       | expected
      ${[null]}                                                                  | ${[null]}
      ${null}                                                                    | ${[null]}
      ${[]}                                                                      | ${[]}
      ${"data:image/png;base64,theData"}                                         | ${[{ value: "data:image/png;base64,theData", mime: "image/png" }]}
      ${["data:image/png;base64,firstData", "data:image/png;base64,secondData"]} | ${["data:image/png;base64,firstData", "data:image/png;base64,secondData"].map((s) => ({ value: s, mime: "image/png" }))}
    `("[$#] Should respect blob value: $blob", (data) => {
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

      describe.each`
        value
        ${true}
        ${false}
      `("[$#] Should provide single value `$value` and complete", (data) => {
        const { value } = data;
        const values = [value];
        const config: EditingConfig = {
          initialDelayMs: 0,
          changeDelayMs: 1,
          editing: values,
        };

        const observable = observeEditing(config);

        testShouldRetrieveValues(observable, values);
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

      describe.each`
        value
        ${true}
        ${false}
      `("[$#] Should provide single value `$value` and complete", (data) => {
        const { value } = data;
        const values = [value];
        const config: ReadableConfig = {
          initialDelayMs: 0,
          changeDelayMs: 1,
          readable: values,
        };
        const observable = observeReadable(config);

        testShouldRetrieveValues(observable, values);
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
