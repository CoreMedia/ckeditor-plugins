/**
 * Type-Guard for DOM `Comment`.
 *
 * @param value - value to guard
 */
export const isComment = (value: unknown): value is CharacterData => value instanceof Comment;
