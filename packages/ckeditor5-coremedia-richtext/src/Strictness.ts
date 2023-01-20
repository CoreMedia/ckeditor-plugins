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
}
