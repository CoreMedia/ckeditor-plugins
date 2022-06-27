import { htmlEncodingMap } from "./SymbolFontMap";

/**
 * A mapping table for a certain font.
 * This table maps a decimal code point value to a replacement string.
 */
export type FontMap = Map<number, string>;

/**
 * A FontMapping defines a strategy on how to map characters of a given
 * font-family to their alternative representation.
 *
 * A FontMapping must be provided with a corresponding map that defines
 * the representation mapping for the font's characters.
 * Please note, that a given map will always be extended with an {@link htmlEncodingMap},
 * a minimum replacement map for custom mappings.
 *
 */
export class FontMapping {
  private map: FontMap;
  private DECODE_ELEMENT_HELP = document.createElement("div");

  constructor(map: FontMap) {
    this.map = this.#mergeFontMaps(htmlEncodingMap, map);
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
  applyMapConfig(map: FontMap, mode: string | undefined): void {
    if (mode && mode.toLowerCase() === "replace") {
      this.map = this.#mergeFontMaps(htmlEncodingMap, map);
    } else {
      this.map = this.#mergeFontMaps(this.map, map);
    }
  }

  /**
   * Merges two FontMaps into one.
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
  toReplacementCharacter(input: string): string {
    const decodedInput: string | null = this.#decodeHtmlEntities(input);
    const characters: Array<string> = [...decodedInput];
    const replacedInput: Array<string | null> = characters.map((value) => {
      const charCode = value.charCodeAt(0);
      const htmlEntity = this.map.get(charCode);
      if (htmlEntity) {
        return this.#decodeHtmlEntities(htmlEntity);
      }
      return String.fromCharCode(charCode);
    });
    return replacedInput.join();
  }

  /**
   * Decodes all HTML entities of the content of a text node.
   *
   * Some characters like ", ' and non-breakable-space will be encoded when Word places the HTML
   * into the clipboard. Thus to prevent for example &nbsp; to be transformed to &&nu;&beta;&sigma;&pi;; we
   * need to first decode the HTML.
   *
   * @param inputString - text node content
   * @see {@link https://stackoverflow.com/questions/5796718/html-entity-decode| javascript - HTML Entity Decode - Stack Overflow}
   * @returns the decoded string
   */
  #decodeHtmlEntities(inputString: string): string {
    this.DECODE_ELEMENT_HELP.innerHTML = inputString;
    const textContent = this.DECODE_ELEMENT_HELP.textContent;
    if (!textContent) {
      // see https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent
      throw new Error("Error during decodeHtmlEntities: HTMLDivElement has no textContent");
    }
    return textContent;
  }
}
