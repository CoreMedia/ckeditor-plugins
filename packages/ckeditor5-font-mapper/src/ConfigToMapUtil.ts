/**
 * UTF8 Character Code.
 */
type CharCode = number;
/**
 * HTML string. Typically, encoded characters, such as `&pi;`.
 */
type HtmlString = string;
/**
 * Maps UTF8 character codes to their HTML representation after being mapped.
 */
type FontMap = Map<CharCode, HtmlString>;
/**
 * `FontMap` as represented in CKEditor configuration.
 */
interface FontMapConfig {
  [code: CharCode]: HtmlString;
}
/**
 * Maps configuration entries to corresponding `FontMap` entries.
 */
const configEntryToFontMapEntry = ([k, v]: [string, unknown]): [CharCode, HtmlString] => [Number(k), String(v)];
/**
 * Maps the FontMap configuration to corresponding `FontMap` instance.
 */
export const configToMap = (config: FontMapConfig): FontMap => {
  const entries = Object.entries(config).map(configEntryToFontMapEntry);
  return new Map(entries);
};
