import {
  MutableProperties,
  MutablePropertiesConfig,
  observeEditing,
  observeReadable,
  observeName,
  withPropertiesDefaults,
} from "../../src/content/MutableProperties";
import Delayed from "../../src/content/Delayed";
import { take } from "rxjs/operators";
import { Observable } from "rxjs";

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
      ${"data:image/png;base64,theData"}                                         | ${["data:image/png;base64,theData"]}
      ${["data:image/png;base64,firstData", "data:image/png;base64,secondData"]} | ${["data:image/png;base64,firstData", "data:image/png;base64,secondData"]}
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
    // Ensure calling with `await`
    const observeAndAssert = <T>(observable: Observable<T>, expectedValues: T[], done: jest.DoneCallback) => {
      const receivedValues: T[] = [];
      expect.hasAssertions();
      observable.subscribe({
        next: (received) => receivedValues.push(received),
        error: (error) => done(error),
        complete: () => {
          expect(receivedValues).toStrictEqual(expectedValues);
          done();
        },
      });
    };

    describe("observeName", () => {
      type NameConfig = Delayed & Pick<MutableProperties, "name">;

      test("Should provide single name and complete", (done) => {
        const config: NameConfig = {
          initialDelayMs: 0,
          changeDelayMs: 1,
          name: ["Lorem"],
        };
        const expectedValues = ["Lorem"];
        const observable = observeName(config);

        observeAndAssert(observable, expectedValues, done);
      });

      test("Should just complete for no names to provide", (done) => {
        const config: NameConfig = {
          initialDelayMs: 0,
          changeDelayMs: 1,
          name: [],
        };
        const expectedValues: string[] = [];
        const observable = observeName(config);

        observeAndAssert(observable, expectedValues, done);
      });

      test("Should provide names and restart", (done) => {
        const config: NameConfig = {
          initialDelayMs: 0,
          changeDelayMs: 1,
          name: ["Lorem", "Ipsum"],
        };
        const expectedValues = ["Lorem", "Ipsum", "Lorem"];
        // We only take values from first iteration, and the first of
        // the second, to see looping behavior.
        const observable = observeName(config).pipe(take(expectedValues.length));

        observeAndAssert(observable, expectedValues, done);
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
        const config: EditingConfig = {
          initialDelayMs: 0,
          changeDelayMs: 1,
          editing: [value],
        };
        const expectedValues = [value];
        const observable = observeEditing(config);

        // Workaround, to not mix test.each with async tests.
        test("Observe and Assert", (done) => observeAndAssert(observable, expectedValues, done));
      });

      test("Should just complete for no values to provide", (done) => {
        const config: EditingConfig = {
          initialDelayMs: 0,
          changeDelayMs: 1,
          editing: [],
        };
        const expectedValues: boolean[] = [];
        const observable = observeEditing(config);

        observeAndAssert(observable, expectedValues, done);
      });

      test("Should provide values and restart", (done) => {
        const config: EditingConfig = {
          initialDelayMs: 0,
          changeDelayMs: 1,
          editing: [true, false],
        };
        const expectedValues = [true, false, true];
        // We only take values from first iteration, and the first of
        // the second, to see looping behavior.
        const observable = observeEditing(config).pipe(take(expectedValues.length));

        observeAndAssert(observable, expectedValues, done);
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
        const config: ReadableConfig = {
          initialDelayMs: 0,
          changeDelayMs: 1,
          readable: [value],
        };
        const expectedValues = [value];
        const observable = observeReadable(config);

        // Workaround, to not mix test.each with async tests.
        test("Observe and Assert", (done) => observeAndAssert(observable, expectedValues, done));
      });

      test("Should just complete for no values to provide", (done) => {
        const config: ReadableConfig = {
          initialDelayMs: 0,
          changeDelayMs: 1,
          readable: [],
        };
        const expectedValues: boolean[] = [];
        const observable = observeReadable(config);

        observeAndAssert(observable, expectedValues, done);
      });

      test("Should provide values and restart", (done) => {
        const config: ReadableConfig = {
          initialDelayMs: 0,
          changeDelayMs: 1,
          readable: [true, false],
        };
        const expectedValues = [true, false, true];
        // We only take values from first iteration, and the first of
        // the second, to see looping behavior.
        const observable = observeReadable(config).pipe(take(expectedValues.length));

        observeAndAssert(observable, expectedValues, done);
      });
    });
  });
});
