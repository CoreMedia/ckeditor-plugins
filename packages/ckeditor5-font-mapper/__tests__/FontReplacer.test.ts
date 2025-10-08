import "global-jsdom/register";
import test, { TestContext } from "node:test";
import assert from "node:assert";
import { escapeFontFamily } from "../src/FontReplacer.js";

const cases: [string, string][] = [
  [",Symbol", "Symbol"],
  ["Symbol", "Symbol"],
  ["Georgia, serif", "Georgia"],
  ['"Gill Sans Extrabold", sans-serif', "Gill Sans Extrabold"],
  ["sans-serif", "sans-serif"],
  [" cursive", "cursive"],
  ["system-ui ,serif", "system-ui"],
];

void test("escapeFontFamily parses correctly", async (t: TestContext) => {
  for (const [input, expected] of cases) {
    await t.test(
      `Should '${input}' parse to the first font-family '${expected}' without leading and trailing special characters.`,
      () => {
        const actual = escapeFontFamily(input);
        assert.strictEqual(actual, expected);
      },
    );
  }
});
