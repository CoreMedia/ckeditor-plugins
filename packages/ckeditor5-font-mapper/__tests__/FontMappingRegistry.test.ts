import "global-jsdom/register";
import test, { TestContext } from "node:test";
import assert from "node:assert";
import { expect } from "expect";
import { FontMappingRegistry } from "../src/FontMappingRegistry";
import { configToMap } from "../src/ConfigToMapUtil";
import { Mode } from "../src";

// Helper for spying on a method
function createSpy<T extends (...args: any[]) => any>(obj: any, methodName: string) {
  const original = obj[methodName] as T;
  const calls: Parameters<T>[] = [];
  obj[methodName] = ((...args: any[]) => {
    calls.push(args);
    return original.apply(obj, args);
  }) as T;
  return { calls, restore: () => (obj[methodName] = original) };
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

      // Create a spy manually
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
