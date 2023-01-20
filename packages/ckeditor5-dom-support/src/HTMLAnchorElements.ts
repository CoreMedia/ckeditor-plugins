/**
 * Type-Guard for DOM `HTMLAnchorElement`.
 *
 * @param value - value to guard
 */
export const isHTMLAnchorElement = (value: unknown): value is HTMLAnchorElement => value instanceof HTMLAnchorElement;
