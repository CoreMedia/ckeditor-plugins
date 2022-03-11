/**
 * Utility type: Make properties of R required, assuming that T is a subtype
 * of R.
 *
 * @example
 * ```typescript
 * const obj: RequiredFrom<SubType, SuperType> = { required: true };
 * ```
 */
type RequiredFrom<T extends Partial<R>, R> = Omit<T, keyof R> & Required<R>;

/**
 * Extends given input by required defaults as given by type `R`.
 *
 * @param input - input object
 * @param defaults - output object, having properties of R as required properties
 */
const withDefaults = <T extends Partial<R>, R>(input: T, defaults: Required<R>): RequiredFrom<T, R> => {
  return { ...defaults, ...input };
};

export default RequiredFrom;
export { withDefaults };
