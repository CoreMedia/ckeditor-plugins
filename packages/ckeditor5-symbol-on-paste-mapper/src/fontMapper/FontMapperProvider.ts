import FontMapper from "./FontMapper";
import SymbolFontMapper from "./SymbolFontMapper";

export default class FontMapperProvider {
  static mapper: Array<FontMapper> = [new SymbolFontMapper()];

  static getFontMapper(fontFamilyStyle: string | undefined): FontMapper | null {
    if (!fontFamilyStyle) {
      return null;
    }
    for (const fontMapper of FontMapperProvider.mapper) {
      if (fontMapper.matches(fontFamilyStyle)) {
        return fontMapper;
      }
    }
    return null;
  }

  static replaceFontMapper(newMappers: Array<FontMapper>): void {
    FontMapperProvider.mapper = [];
    for (const newMapper of newMappers) {
      FontMapperProvider.mapper.push(newMapper);
    }
  }
}
