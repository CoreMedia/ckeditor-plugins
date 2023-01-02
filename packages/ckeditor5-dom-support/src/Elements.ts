/**
 * Type-Guard for DOM `Element`.
 *
 * @param value - value to guard
 */
export const isElement = (value: unknown): value is Element => value instanceof Element;
