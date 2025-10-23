/**
 * Response from `increaseUpToAndRestart`.
 */
interface IncreaseUpToAndRestartResponse {
  /**
   * New incremented value.
   */
  value: number;
  /**
   * Signals, if we restarted from 0 (zero).
   */
  restart: boolean;
}

/**
 * Increase given input until upper bound. Returned value will be normalized to
 * 0, once it reaches `upperBoundExcluding`.
 *
 * **Special case:** If upper bound is 0 (zero), the resulting value is always
 * 0 (zero) and immediately signals `restart === true`.
 *
 * @param input - value to increase
 * @param upperBoundExcluding - upper bound, which returned value must not reach
 * but instead will wrap around to 0
 */
const increaseUpToAndRestart = (input: number, upperBoundExcluding: number): IncreaseUpToAndRestartResponse => {
  if (upperBoundExcluding < 1) {
    return {
      value: 0,
      restart: true,
    };
  }

  const value = (input + 1) % upperBoundExcluding;
  const restart = input >= value;
  return { value, restart };
};

/**
 * Type-Guard for c being an object or not.
 *
 * @param c - instance to check
 */
const isObject = (c: unknown): c is Record<string, unknown> => typeof c === "object" && c !== null;

/**
 * Utility type to map a given type to an atomic or array type.
 */
type AtomicOrArray<T> = T | T[];

/**
 * Set the first character to upper-case.
 *
 * @param str - string to transform; empty strings will be returned unchanged
 */
const capitalize = (str: string): string => str.slice(0, 1).toUpperCase() + str.slice(1);

export type { AtomicOrArray, IncreaseUpToAndRestartResponse };
export { capitalize, increaseUpToAndRestart, isObject };
