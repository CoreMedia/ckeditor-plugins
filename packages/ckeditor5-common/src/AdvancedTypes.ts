/**
 * Intermediate raw type for type check.
 */
export type Raw<T> = {
  [P in keyof T]: unknown;
};

/**
 * Type Guard checking for properties to exist. Workaround for
 * `microsoft/TypeScript#21732` to help to implement type guards
 * checking subsequent property value types.
 *
 * @param value - value to check
 * @param requiredProperties - expected properties to exist
 */
export const isRaw = <T>(value: unknown, ...requiredProperties: (keyof T)[]): value is Raw<T> => {
  if (typeof value === "object" && !!value) {
    for (const p of requiredProperties) {
      if (!(p in value)) {
        return false;
      }
    }
    return true;
  }
  return false;
};
