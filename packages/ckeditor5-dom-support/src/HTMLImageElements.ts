/**
 * Type-Guard for DOM `HTMLImageElement`.
 *
 * @param value - value to guard
 */
export const isHTMLImageElement = (value: unknown): value is HTMLImageElement => value instanceof HTMLImageElement;
