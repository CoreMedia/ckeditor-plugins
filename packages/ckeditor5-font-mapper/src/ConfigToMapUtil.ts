/**
 * UTF8 Character Code.
 */
export type CharCode = number;
/**
 * HTML string. Typically, encoded characters, such as `&pi;`.
 */
export type HtmlString = string;
/**
 * Maps UTF8 character codes to their HTML representation after being mapped.
 */
export type ParsedFontMap = Map<CharCode, HtmlString>;
/**
 * `FontMap` as represented in CKEditor configuration.
 */
export type FontMapConfig = Record<CharCode, HtmlString>;
/**
 * Maps configuration entries to corresponding `FontMap` entries.
 */
const configEntryToFontMapEntry = ([k, v]: [string, unknown]): [CharCode, HtmlString] => [Number(k), String(v)];
/**
 * Maps the FontMap configuration to corresponding `FontMap` instance.
 */
export const configToMap = (config: FontMapConfig): ParsedFontMap => {
  const entries = Object.entries(config).map(configEntryToFontMapEntry);
  return new Map(entries);
};
