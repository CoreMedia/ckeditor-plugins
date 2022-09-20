/**
 * Intermediate raw type for type check.
 *
 * @typeParam T - type to get keys from
 */
export type Raw<T> = {
  /**
   * Intermediate key-value mapping during type-casts with yet unknown
   * value types.
   */
  [P in keyof T]: unknown;
};

/**
 * Type Guard checking for properties to exist. Workaround for
 * `microsoft/TypeScript#21732` to help to implement type guards
 * checking subsequent property value types.
 *
 * @example
 *
 * ```typescript
 * const isEditorWithUI = <T extends Editor>(value: T): value is T & EditorWithUI => {
 *   // first see, if required keys are available
 *   if (isRaw<EditorWithUI>(value, "ui")) {
 *     // then check these keys if they pass the type-guard
 *     return typeof value.ui === "object";
 *   }
 *   return false;
 * };
 * ```
 * @param value - value to check
 * @param requiredProperties - expected properties to exist
 * @typeParam T - target guarded type
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
