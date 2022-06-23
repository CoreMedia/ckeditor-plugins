import FontMappingRegistry from "../../src/fontMapping/FontMappingRegistry";
import FontMapping from "../../src/fontMapping/FontMapping";

test("should return a FontMapper for symbols", () => {
  const fontMapper: FontMapping | undefined = FontMappingRegistry.getFontMapping("symbol");
  expect(fontMapper).toBeDefined();
});
