/**
 * Type-Guard for DOM `CharacterData`.
 *
 * @param value - value to guard
 */
export const isCharacterData = (value: unknown): value is CharacterData => value instanceof CharacterData;
