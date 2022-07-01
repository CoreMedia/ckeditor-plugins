/**
 * Private indicator for normalized data.
 */
const normalized = Symbol("normalized");
/**
 * We just add some prefix to the string to mark it as normalized. Here:
 * `n(ormalize)d` = `n8d` (similar to i18n, l10n, ...).
 */
const normalizedPrefix = "n8d:";
/**
 * Some token to add for type-safety.
 */
type NormalizedToken = { [normalized]: never };
/**
 * Represents a normalized data string to be able to distinguish a normal
 * string from a normalized data string.
 */
export type NormalizedData = string & NormalizedToken;
/**
 * Type-Guard to detect normalized data string.
 *
 * @param value - value to validate if it represents a normalized data string.
 */
export const isNormalizedData = (value: string): value is NormalizedData => {
  return value.startsWith(normalizedPrefix);
};
/**
 * Marks the given string as being normalized data. Returns already normalized
 * data strings as is.
 *
 * @param value - string value to mark as normalized
 */
export const toNormalizedData = (value: string): NormalizedData =>
  isNormalizedData(value) ? value : (`${normalizedPrefix}${value}` as NormalizedData);
