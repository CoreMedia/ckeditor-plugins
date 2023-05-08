import { FontMappingRegistry } from "../src/FontMappingRegistry";
import { configToMap } from "../src/ConfigToMapUtil";
import { Mode } from "../src";

test("Should return a FontMapper for symbol and ignore case", () => {
  const fontMappingRegistry = new FontMappingRegistry();
  expect(fontMappingRegistry.getFontMapping("symbol")).toBeDefined();
  expect(fontMappingRegistry.getFontMapping("Symbol")).toBeDefined();
});

it.each([
  ["symbol", { 34: "&forall;" }, undefined],
  ["symbol", { 34: "&forall;" }, "replace"],
  ["symbol", { 34: "&forall;" }, "append"],
])(
  "Should apply map %s with mode %s when font %s is already registered to be mapped",
  // @ts-expect-error somehow typescript does not recognize that "append" and "replace" are the defined options for mode.
  (font: string, fontMap: Record<number, string>, mode: Mode | undefined) => {
    const fontMappingRegistry = new FontMappingRegistry();
    const fontMapping = fontMappingRegistry.getFontMapping("symbol");
    expect(fontMapping).toBeDefined();

    // @ts-expect-error typescript complains that fontMapping might be undefined even if there is an expect().toBeDefined.
    const spy = jest.spyOn(fontMapping, "applyMapConfig");
    fontMappingRegistry.registerFontMapping({
      font,
      map: fontMap,
      mode,
    });
    expect(spy).toBeCalledWith(configToMap(fontMap), mode);
  }
);

it.each([
  ["anotherFont", { 34: "&forall;" }, undefined],
  ["anotherFont", { 34: "&forall;" }, "append"],
])(
  "Should add font '%s' with font mapping '%s' if font is not registered yet, ignoring mode '%s'",
  // @ts-expect-error somehow typescript does not recognize that "append" and "replace" are the defined options for mode.
  (font: string, fontMap: Record<number, string>, mode: Mode | undefined) => {
    const fontMappingRegistry = new FontMappingRegistry();

    fontMappingRegistry.registerFontMapping({
      font,
      map: fontMap,
      mode,
    });
    const newFontMapping = fontMappingRegistry.getFontMapping("anotherFont");
    expect(newFontMapping).toBeDefined();
  }
);
