import FontMapperProvider from "../../src/fontMapping/FontMapperProvider";
import FontMapping from "../../src/fontMapping/FontMapping";

test("should return a FontMapper for symbols", () => {
  const fontMapper: FontMapping | null = FontMapperProvider.getFontMapper("symbol");
  expect(fontMapper).toBeDefined();
});
