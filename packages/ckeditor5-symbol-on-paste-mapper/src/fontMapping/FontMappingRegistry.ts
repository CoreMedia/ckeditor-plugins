import { FontMapperConfigEntry } from "FontMapper";
import FontMapping, { FontMap } from "./FontMapping";
import { symbolFontMap } from "./SymbolFontMap";

/**
 * A global registry for `FontMappings`.
 * This registry is used to register `FontMappings` for different fonts,
 * which hold information on how to convert said font's characters into corresponding entities.
 *
 * By default, this registry holds a Mapping for the "Symbol" font.
 * Existing mappings can be altered and new ones can be added via the {@link registerFontMapping} method.
 */
export class FontMappingRegistry {
  fontMappings: Map<string, FontMapping> = new Map();

  constructor() {
    this.#registerDefaultSymbolFontMapping();
  }

  #registerDefaultSymbolFontMapping() {
    const symbolFontMapping: FontMapping = new FontMapping(symbolFontMap);
    this.fontMappings.set("symbol", symbolFontMapping);
  }

  registerFontMapping(fontMapperConfigEntry: FontMapperConfigEntry): void {
    const { font: fontKey, map, mode, unpack } = fontMapperConfigEntry;

    const registeredFontMapping = this.getFontMapping(fontKey);
    if (registeredFontMapping) {
      registeredFontMapping.applyMapConfig(mode, this.#configObjectToMap(map));
    } else {
      this.fontMappings.set(fontKey.toLowerCase(), new FontMapping(this.#configObjectToMap(map), unpack));
    }
  }

  /**
   * Converts a simple object into a FontMap.
   * The object must have number keys.
   * Used to convert mappings in a configuration object into a FontMap.
   *
   * @param configMapObject - the object
   * @returns a FontMap
   */
  #configObjectToMap(configMapObject: { [key: number]: string }): FontMap {
    const map: FontMap = new Map();
    for (const [key, value] of Object.entries(configMapObject)) {
      map.set(Number(key), value);
    }
    return map;
  }

  /**
   * Returns a FontMapping for a given font-family, if present in the registry.
   *
   * @param fontKey - the name of the font-family
   * @returns a FontMapping or null if no Mapping exists for the given font
   */
  getFontMapping(fontKey: string): FontMapping | null {
    const fontMapping = this.fontMappings.get(fontKey.toLowerCase());
    if (fontMapping) {
      return fontMapping;
    }
    return null;
  }
}

export default new FontMappingRegistry();
