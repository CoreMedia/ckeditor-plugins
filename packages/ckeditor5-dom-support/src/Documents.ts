/**
 * Type-Guard for DOM `Document`.
 *
 * @param value - value to guard
 */
export const isDocument = (value: unknown): value is Document => value instanceof Document;
