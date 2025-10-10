import test, { describe } from "node:test";
import expect from "expect";
import { capitalize, increaseUpToAndRestart, isObject } from "../../src/content/MockContentUtils";

const someFunction = () => {
  // irrelevant, only type required
};

void describe("MockContentUtils", () => {
  const testCases = [
    { input: 0, upperBound: 0, expected: 0, expectedRestart: true },
    { input: 0, upperBound: 1, expected: 0, expectedRestart: true },
    { input: 0, upperBound: -1, expected: 0, expectedRestart: true },
    { input: 1, upperBound: 0, expected: 0, expectedRestart: true },
    { input: 1, upperBound: 1, expected: 0, expectedRestart: true },
    { input: 2, upperBound: 1, expected: 0, expectedRestart: true },
    { input: 0, upperBound: 2, expected: 1, expectedRestart: false },
    { input: 1, upperBound: 2, expected: 0, expectedRestart: true },
  ];

  void describe("increaseUpToAndRestart()", () => {
    for (const [i, { input, upperBound, expected, expectedRestart }] of testCases.entries()) {
      void test(`[${i}] increaseUpToAndRestart(${input}, ${upperBound}) = ${expected}, restart? ${expectedRestart}`, () => {
        const actual = increaseUpToAndRestart(input, upperBound);
        expect(actual).toStrictEqual({
          value: expected,
          restart: expectedRestart,
        });
      });
    }
  });

  const testCases2 = [
    { input: undefined, expected: false },
    { input: null, expected: false },
    { input: [], expected: true },
    { input: "", expected: false },
    { input: "lorem", expected: false },
    { input: ["lorem"], expected: true },
    { input: 0, expected: false },
    { input: 42, expected: false },
    { input: [42], expected: true },
    { input: false, expected: false },
    { input: true, expected: false },
    { input: [true], expected: true },
    { input: Symbol("@"), expected: false },
    { input: BigInt(0), expected: false },
    { input: someFunction, expected: false },
    { input: {}, expected: true },
    { input: { lorem: "ipsum" }, expected: true },
  ];

  void describe("isObject()", () => {
    for (const [i, { input, expected }] of testCases2.entries()) {
      void test(`[${i}] isObject(${formatValue(input)}) = ${expected}`, () => {
        expect(isObject(input)).toStrictEqual(expected);
      });
    }
  });

  // Helper to make test names readable
  function formatValue(val: unknown): string {
    if (val === undefined) return "undefined";
    if (val === null) return "null";
    if (typeof val === "function") return val.name || "function";
    if (typeof val === "symbol") return val.toString();
    if (typeof val === "bigint") return val.toString() + "n";
    if (Array.isArray(val)) return `[${val.map(formatValue).join(", ")}]`;
    if (typeof val === "object") return JSON.stringify(val);
    return String(val);
  }

  const testCases3 = [
    { input: "", expected: "" },
    { input: "a", expected: "A" },
    { input: "A", expected: "A" },
    { input: "lorem", expected: "Lorem" },
    { input: "Lorem", expected: "Lorem" },
    { input: "loremIpsum", expected: "LoremIpsum" },
    { input: "_", expected: "_" },
    { input: "_lorem", expected: "_lorem" },
  ];

  void describe("capitalize()", () => {
    for (const [i, { input, expected }] of testCases3.entries()) {
      void test(`[${i}] capitalize("${input}") = "${expected}"`, () => {
        expect(capitalize(input)).toStrictEqual(expected);
      });
    }
  });
});
