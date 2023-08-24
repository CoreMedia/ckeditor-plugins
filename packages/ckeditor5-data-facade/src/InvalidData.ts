/**
 * Signals a context mismatch.
 */
export const invalidContext = Symbol("invalidContext");

/**
 * Type for context mismatch.
 */
export type InvalidContext = typeof invalidContext;

/**
 * Signals unavailable data.
 */
export const dataUnavailable = Symbol("dataUnavailable");

/**
 * Type for unavailable data.
 */
export type DataUnavailable = typeof dataUnavailable;

/**
 * Type for signals if the retrieved data are considered invalid.
 */
export type InvalidData = InvalidContext | DataUnavailable;

/**
 * Type-guard for possibly invalid data.
 *
 * @param value - value to guard
 */
export const isInvalidData = (value: unknown): value is InvalidData =>
  value === invalidContext || value === dataUnavailable;
