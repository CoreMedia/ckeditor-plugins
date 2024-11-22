import Delayed from "../../src/content/Delayed";
import { NameHintConfig, observeNameHint, unreadableNameHint } from "../../src/content/DisplayHints";
import { DisplayHint } from "@coremedia/ckeditor5-coremedia-studio-integration";
import { testShouldRetrieveValues } from "./ObservableTestUtil";

const delays: Delayed = { initialDelayMs: 0, changeDelayMs: 1 };

describe("DisplayHints", () => {
  describe("observeNameHint", () => {
    describe.each`
      names                 | loop
      ${["Lorem"]}          | ${false}
      ${["Lorem", "ipsum"]} | ${false}
      ${["Lorem", "ipsum"]} | ${true}
    `("[$#] Should retrieve hints for names: $names (loop? $loop)", ({ names, loop }) => {
      const classes: string[] = [];

      const config: NameHintConfig = {
        ...delays,
        name: names,
        readable: [true],
      };

      const expectedNames = [...names, ...names.slice(0, loop ? 1 : 0)];
      const expectedValues: DisplayHint[] = expectedNames.map(
        (name: string): DisplayHint => ({
          name,
          classes,
        }),
      );
      testShouldRetrieveValues(observeNameHint(config), expectedValues);
    });

    describe.each`
      readableStates          | loop
      ${[true]}               | ${false}
      ${[true, false]}        | ${false}
      ${[true, false]}        | ${true}
      ${[false, true]}        | ${false}
      ${[false, true]}        | ${true}
      ${[true, false, true]}  | ${false}
      ${[true, false, true]}  | ${true}
      ${[false, true, false]} | ${false}
      ${[false, true, false]} | ${true}
    `(
      "[$#] Should retrieve name hints respecting readable states: $readableStates (loop? $loop)",
      ({ readableStates, loop }) => {
        const name = "Lorem";
        const classes: string[] = [];

        const config: NameHintConfig = {
          ...delays,
          id: 42,
          type: "document",
          name: [name],
          readable: readableStates,
        };

        const expectedReadableHint: DisplayHint = {
          name,
          classes,
        };
        const expectedUnreadableHint: DisplayHint = unreadableNameHint(config, classes);

        const expectedReadableStates = [...readableStates, ...readableStates.slice(0, loop ? 1 : 0)];
        const expectedValues: DisplayHint[] = expectedReadableStates.map(
          (readable: boolean): DisplayHint => (readable ? expectedReadableHint : expectedUnreadableHint),
        );
        testShouldRetrieveValues(observeNameHint(config), expectedValues);
      },
    );
  });
});
