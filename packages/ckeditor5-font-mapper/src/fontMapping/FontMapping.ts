import { htmlEncodingMap } from "./SymbolFontMap";

export type FontMap = Map<number, string>;
export type UnpackFunction = (data: string) => number;

/**
 * An unpack function for utf8 encoded font families.
 * This is the default unpack function for FontMappings.
 *
 * @param data - input character
 * @returns the utf8 character code
 */
const unpackUtf8 = (data: string): number => {
  if (data.length > 1 || data.length < 1) {
    return -1;
  }

  const utf8charCode = data.charCodeAt(0);
  return utf8charCode & 0xff;
};

/**
 * A FontMapping defines a strategy on how to map characters of a given
 * font-family to their alternative representation.
 *
 * A FontMapping must be provided with a corresponding map that defines
 * the representation mapping for the font's characters.
 * Please note, that a given map will always be extended with an {@link htmlEncodingMap},
 * a minimum replacement map for custom mappings.
 *
 * It also accepts an optional `unpackFct`. This function controls how input
 * characters are translated into their character codes.
 * By default, FontMappings will use the {@link unpackUtf8} function, which
 * work for utf8 character encoded fonts. Please provide a fitting unpack
 * function for fonts with different character encoding.
 *
 */
export default class FontMapping {
  private map: FontMap;
  private unpack: UnpackFunction;
  private DECODE_ELEMENT_HELP = document.createElement("div");

  constructor(map: FontMap, unpackFct: UnpackFunction = unpackUtf8) {
    this.map = this.#mergeFontMaps(htmlEncodingMap, map);
    this.unpack = unpackFct;
  }

  /**
   * Alters the FontMap of this FontMapping.
   * This method is especially used to change the "Symbol" FontMapping after it has been registered
   * with its default map. The custom configuration of this plugin might then change this map
   * or replace it entirely.
   *
   * @param mode - the apply mode (only "replace" is taken into account)
   * @param map - the custom map to alter the existing FontMap
   */
  applyMapConfig(mode: string | undefined, map: FontMap): void {
    if (mode && mode.toLowerCase() === "replace") {
      this.map = this.#mergeFontMaps(htmlEncodingMap, map);
    } else {
      this.map = this.#mergeFontMaps(this.map, map);
    }
  }

  /**
   * Merges 2 FontMaps into one.
   * The first FontMap `baseFontMap` serves as the base for the output map.
   * The contents of the second FontMap `additionalMap` will be added afterwards
   * and override duplicate entries.
   *
   * @param baseFontMap - the base fontMap
   * @param additionalMap - the additional mapping to apply to the fontMapping's map
   * @returns the merge result as a new map
   */
  #mergeFontMaps(baseFontMap: FontMap, additionalMap: FontMap): FontMap {
    const baseFontMapCopy = new Map(baseFontMap);
    additionalMap.forEach((value, key) => {
      baseFontMapCopy.set(key, value);
    });
    return baseFontMapCopy;
  }

  /**
   * Maps a character or a string to their corresponding entity.
   *
   * @param input - a character or a string to be mapped to their corresponding entity
   * @returns the corresponding entity
   */
  toEscapedHtml(input: string): string {
    const chars: Array<string> = [...input];
    const replaced: Array<string | null> = chars.map((value) => {
      const textChar: number = this.unpack(value);
      if (this.map.has(textChar)) {
        const htmlReplacement: string | undefined = this.map.get(textChar);
        if (htmlReplacement) {
          return this.#decodeHtmlEntities(htmlReplacement);
        }
      }
      return String.fromCharCode(textChar);
    });
    return replaced.join();
  }

  #decodeHtmlEntities(str: string): string | null {
    this.DECODE_ELEMENT_HELP.innerHTML = str;
    return this.DECODE_ELEMENT_HELP.textContent;
  }
}
