import { FontMapperConfigEntry } from "FontMapper";
import { configToMap } from "./ConfigToMapUtil";
import { FontMapping } from "./FontMapping";
import { symbolFontMap } from "./SymbolFontMap";

/**
 * A global registry for `FontMappings`.
 * This registry is used to register `FontMappings` for different fonts,
 * which hold information on how to convert said font's characters into
 * corresponding entities.
 *
 * By default, this registry holds a Mapping for the "Symbol" font.
 * Existing mappings can be altered and new ones can be added via the
 * {@link registerFontMapping} method.
 */
export class FontMappingRegistry {
  readonly #fontMappings: Map<string, FontMapping> = new Map();

  constructor() {
    this.#registerDefaultSymbolFontMapping();
  }

  #registerDefaultSymbolFontMapping() {
    const symbolFontMapping: FontMapping = new FontMapping(symbolFontMap);
    this.#fontMappings.set("symbol", symbolFontMapping);
  }

  registerFontMapping(fontMapperConfigEntry: FontMapperConfigEntry): void {
    const { font: fontKey, map, mode } = fontMapperConfigEntry;
    const configObjectMap = configToMap(map);

    const registeredFontMapping = this.getFontMapping(fontKey);

    if (registeredFontMapping) {
      registeredFontMapping.applyMapConfig(configObjectMap, mode);
    } else {
      const fontMapping = new FontMapping(configObjectMap);
      this.#fontMappings.set(fontKey.toLowerCase(), fontMapping);
    }
  }
  /**
   * Returns a FontMapping for a given font-family, if present in the registry.
   *
   * @param fontKey - the name of the font-family
   * @returns a FontMapping or undefined if no Mapping exists for the given font
   */
  getFontMapping(fontKey: string): FontMapping | undefined {
    return this.#fontMappings.get(fontKey.toLowerCase());
  }
}

export const fontMappingRegistry = new FontMappingRegistry();
