/**
 * Type-Guard for DOM `Text`.
 *
 * @param value - value to guard
 */
export const isText = (value: unknown): value is CharacterData => value instanceof Text;
