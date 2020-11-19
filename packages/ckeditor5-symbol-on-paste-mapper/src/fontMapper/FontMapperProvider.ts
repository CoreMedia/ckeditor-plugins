import FontMapper from "./FontMapper";
import SymbFontMapper from "./SymbFontMapper";

export default class FontMapperProvider {
  static mapper: Array<FontMapper> = [new SymbFontMapper()];

  static getFontMapper(fontFamilyStyle: string): FontMapper | null {
    for (const fontMapper of FontMapperProvider.mapper) {
      if (fontMapper.matches(fontFamilyStyle)) {
        return fontMapper;
      }
    }
    return null;
  }
}
