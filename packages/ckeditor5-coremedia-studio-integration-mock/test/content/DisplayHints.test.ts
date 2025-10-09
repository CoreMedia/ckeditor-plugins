import "global-jsdom/register";
import test, { describe } from "node:test";
import Delayed from "../../src/content/Delayed";
import { NameHintConfig, observeNameHint, unreadableNameHint } from "../../src/content/DisplayHints";
import { DisplayHint } from "@coremedia/ckeditor5-coremedia-studio-integration";
import { testShouldRetrieveValues } from "./ObservableTestUtil";

const delays: Delayed = { initialDelayMs: 0, changeDelayMs: 1 };

void describe("DisplayHints", () => {
  void describe("observeNameHint", () => {
    const testCases = [
      {
        names: ["Lorem"],
        loop: false,
      },
      {
        names: ["Lorem", "ipsum"],
        loop: false,
      },
      {
        names: ["Lorem", "ipsum"],
        loop: true,
      },
    ];

    void describe("Should retrieve hints for names", () => {
      for (const [i, { names, loop }] of testCases.entries()) {
        void test(`[${i}] Should retrieve hints for names: ${JSON.stringify(names)} (loop? ${loop})`, () => {
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
      }
    });

    const testCases2 = [
      { readableStates: [true], loop: false },
      { readableStates: [true, false], loop: false },
      { readableStates: [true, false], loop: true },
      { readableStates: [false, true], loop: false },
      { readableStates: [false, true], loop: true },
      { readableStates: [true, false, true], loop: false },
      { readableStates: [true, false, true], loop: true },
      { readableStates: [false, true, false], loop: false },
      { readableStates: [false, true, false], loop: true },
    ];

    void describe("Should retrieve name hints respecting readable states", () => {
      for (const [i, { readableStates, loop }] of testCases2.entries()) {
        void test(`[${i}] Should retrieve name hints respecting readable states: ${JSON.stringify(
          readableStates,
        )} (loop? ${loop})`, () => {
          const name = "Lorem";
          const classes: string[] = [];

          const config: NameHintConfig = {
            ...delays,
            id: 42,
            type: "document",
            name: [name],
            readable: readableStates,
          };

          const expectedReadableHint: DisplayHint = { name, classes };
          const expectedUnreadableHint: DisplayHint = unreadableNameHint(config, classes);

          const expectedReadableStates = [...readableStates, ...readableStates.slice(0, loop ? 1 : 0)];
          const expectedValues: DisplayHint[] = expectedReadableStates.map((readable: boolean) =>
            readable ? expectedReadableHint : expectedUnreadableHint,
          );

          testShouldRetrieveValues(observeNameHint(config), expectedValues);
        });
      }
    });
  });
});
