import "global-jsdom/register";
import type { TestContext } from "node:test";
import test from "node:test";
import assert from "node:assert";
import { expect } from "expect";
import { FontMappingRegistry } from "../src/FontMappingRegistry";
import { configToMap } from "../src/ConfigToMapUtil";
import type { Mode } from "../src";
import { FontMapping } from "../src/FontMapping";

// Helper for spying on a method
function createSpy<
  K extends keyof FontMapping
>(
  obj: FontMapping,
  methodName: K
): { restore: () => void; calls: Parameters<FontMapping[K]>[] } {
  const original = obj[methodName];

  if (typeof original !== 'function') {
    throw new Error(`${String(methodName)} is not a function`);
  }

  const calls: Parameters<typeof original>[] = [];

  (obj as FontMapping)[methodName] = (function (
    this: FontMapping,
    ...args: Parameters<typeof original>
  ) {
    calls.push(args);
    return (original as (...args: Parameters<typeof original>) => ReturnType<typeof original>).apply(
      this,
      args
    );
  }) as FontMapping[K];

  return {
    calls,
    restore: () => {
      (obj as FontMapping)[methodName] = original;
    },
  };
}


// ------------------------------
// Test 1: FontMapper exists and ignores case
test("Should return a FontMapper for symbol and ignore case", () => {
  const fontMappingRegistry = new FontMappingRegistry();
  expect(fontMappingRegistry.getFontMapping("symbol")).toBeDefined();
  expect(fontMappingRegistry.getFontMapping("Symbol")).toBeDefined();
});

// ------------------------------
// Test 2: Apply map for already registered font
const applyMapCases: [string, Record<number, string>, Mode | undefined][] = [
  ["symbol", { 34: "&forall;" }, undefined],
  ["symbol", { 34: "&forall;" }, "replace"],
  ["symbol", { 34: "&forall;" }, "append"],
];

test("Should apply map for already registered font", async (t: TestContext) => {
  for (const [font, fontMap, mode] of applyMapCases) {
    await t.test(`Font ${font} with mode ${mode}`, () => {
      const fontMappingRegistry = new FontMappingRegistry();
      const fontMapping = fontMappingRegistry.getFontMapping("symbol");
      expect(fontMapping).toBeDefined();

      if (!fontMapping) {
        return;
      }
      const spy = createSpy(fontMapping, "applyMapConfig");

      fontMappingRegistry.registerFontMapping({
        font,
        map: fontMap,
        mode,
      });

      // Check that the method was called with correct args
      expect(spy.calls.length).toBe(1);
      assert.deepStrictEqual(
        spy.calls[0],
        [configToMap(fontMap), mode],
        "Expected applyMapConfig called with correct arguments",
      );

      spy.restore();
    });
  }
});

// ------------------------------
// Test 3: Add new font mapping for unregistered font
const addFontCases: [string, Record<number, string>, Mode | undefined][] = [
  ["anotherFont", { 34: "&forall;" }, undefined],
  ["anotherFont", { 34: "&forall;" }, "append"],
];

test("Should add font mapping for unregistered font", async (t: TestContext) => {
  for (const [font, fontMap, mode] of addFontCases) {
    await t.test(`Font ${font} with mode ${mode}`, () => {
      const fontMappingRegistry = new FontMappingRegistry();

      fontMappingRegistry.registerFontMapping({
        font,
        map: fontMap,
        mode,
      });

      const newFontMapping = fontMappingRegistry.getFontMapping(font);
      assert.ok(newFontMapping, "Expected new font mapping to be defined");
    });
  }
});
