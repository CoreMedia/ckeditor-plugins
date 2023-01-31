/**
 * Type for single capital letter.
 */
// DevNote: More strict would be, only allowing alphabetical characters.
export type CapitalLetter = Capitalize<string[0]>;

/**
 * Type for capitalized strings.
 */
export type Capitalized = Capitalize<string>;

/**
 * Returns the first letter of the given string capitalized.
 *
 * @param value - string to provide first letter capitalized; must be non-empty
 */
export const capitalizeFirst = <T extends string>(value: T): CapitalLetter =>
  value.charAt(0).toUpperCase() as CapitalLetter;

/**
 * Capitalizes the given string.
 *
 * @param value - string to capitalize
 */
export const capitalize = <T extends string>(value: T): Capitalize<T> => {
  if (value.length === 0) {
    return "" as Capitalize<T>;
  }
  const firstLetter = capitalizeFirst(value);
  const rest = value.slice(1);
  return `${firstLetter}${rest}` as Capitalize<T>;
};
