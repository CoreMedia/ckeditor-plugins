/**
 * Type-guard if given value is an attribute instance `Attr`.
 *
 * @param value - value to validate
 */
export const isAttr = (value: unknown): value is Attr => value instanceof Attr;
