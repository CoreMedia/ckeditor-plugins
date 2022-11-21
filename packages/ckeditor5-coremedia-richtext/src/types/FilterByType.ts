/**
 * Filters the source type, so that all resulting properties
 * match the given type expressed in condition.
 */
// https://javascript.plainenglish.io/typescript-essentials-conditionally-filter-types-488705bfbf56
export type FilterByType<Source, Condition> = Pick<
  Source,
  { [K in keyof Source]: Source[K] extends Condition ? K : never }[keyof Source]
>;

/**
 * Utility type to only provide access to string typed properties.
 */
export type OnlyStrings<Source> = FilterByType<Source, string>;
