/**
 * Only require the given property and make all other optional.
 *
 * @example
 * ```typescript
 * const example: RequireOnly<MyType, "required"> = { required: true };
 * const example: RequireOnly<MyType, "required" | "other"> = { required: true, other: false };
 * ```
 */
type RequireOnly<T, K extends keyof T> = Partial<Omit<T, K>> & Required<Pick<T, K>>;

export default RequireOnly;
