/**
 * Type-Guard for DOM `DocumentFragment`.
 *
 * @param value - value to guard
 */
export const isDocumentFragment = (value: unknown): value is DocumentFragment => value instanceof DocumentFragment;
