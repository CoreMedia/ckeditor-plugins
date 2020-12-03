import FontMapperProvider from "../../src/fontMapper/FontMapperProvider";
import FontMapper from "../../src/fontMapper/FontMapper";

test('should return a FontMapper for symbols', () => {
  let fontMapper: FontMapper | null = FontMapperProvider.getFontMapper("symbol");
  expect(fontMapper).toBeDefined();
});
