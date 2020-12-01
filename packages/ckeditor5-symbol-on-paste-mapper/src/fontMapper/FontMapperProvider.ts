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

  static replaceFontMapper(newMappers: Array<FontMapper>): void {
    FontMapperProvider.mapper = [];
    for (const newMapper of newMappers) {
      FontMapperProvider.mapper.push(newMapper);
    }
  }
}
