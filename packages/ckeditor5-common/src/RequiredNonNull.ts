/**
 * Utility type, that maps all given properties to required non-null
 * properties. Defaults to all properties of the given type.
 */
export type RequiredNonNull<T, K extends keyof T = keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };

/**
 * Error that is thrown, if required non-null properties are missing, thus, are
 * either `null` or `undefined`.
 */
export class RequiredNonNullPropertiesMissingError extends Error {
  constructor(message?: string) {
    super(message);
    // https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Enforces the given properties to be set. Thus, they must not be `null` or
 * `undefined`.
 *
 * @param obj - object to validate
 * @param propertyNames - property names to enforce being non-null
 */
export const requireNonNulls = <T extends object | Record<string, unknown>, K extends keyof T>(
  obj: T,
  ...propertyNames: K[]
): RequiredNonNull<T, K> => {
  // eslint-disable-next-line no-null/no-null
  const unmatchedProperties = propertyNames.filter((name) => obj[name] === null || obj[name] === undefined);
  if (unmatchedProperties.length > 0) {
    const label = unmatchedProperties.length > 1 ? "properties" : "property";
    throw new RequiredNonNullPropertiesMissingError(
      `Required non-null ${label} missing of ${obj.constructor.name}: ${unmatchedProperties}`
    );
  }
  return obj as RequiredNonNull<T, K>;
};
