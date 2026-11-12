/**
 * Strictness for Schema validation.
 */
export enum Strictness {
  /**
   * `STRICT` enforces completely valid CoreMedia RichText 1.0. In addition to
   * `LOOSE` it will check for <em>meant to be</em>, such as a type called
   * `Number` which states to be numbers only, but regarding the schema allows
   * any (unchecked) character data. In case of `STRICT` non-numbers will be
   * rated invalid.
   */
  STRICT,
  /**
   * `LOOSE` will only check, what the scheme will detect. Given the example
   * about numbers for `STRICT` mode, `LOOSE` will cause to accept any
   * character data.
   */
  LOOSE,
  /**
   * For CKEditor 4 CoreMedia RichText adaptions did not filter for invalid
   * attribute values, but just for required or forbidden attributes. This
   * is the behavior the mode `LEGACY` simulates.
   */
  LEGACY,
  /**
   * Available since v11 of ckeditor-plugins and corresponding data-processing.
   * v10-compatibility will assume `LEGACY` instead.
   */
  NONE,
}

/**
 * Valid strictness keys.
 */
export type StrictnessKey = keyof typeof Strictness;

/**
 * Strictness levels for active sanitation. These strictness levels may
 * occur at runtime during sanitation, while `Strictness.NONE` should not
 * trigger any sanitation.
 */
export type ActiveStrictness = Exclude<Strictness, Strictness.NONE>;

/**
 * Valid active strictness keys.
 */
export type ActiveStrictnessKey = Exclude<StrictnessKey, "NONE">;

/**
 * Default strictness is loose, which is the minimum strictness to ensure,
 * that data represent valid CoreMedia Rich Text 1.0.
 *
 * Default changed from `Strictness.STRICT` to `Strictness.LOOSE` in v11.
 */
export const defaultStrictness = Strictness.LOOSE;
