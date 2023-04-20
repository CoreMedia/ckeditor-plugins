/**
 * Signals to skip further processing. Examples are that a node and its
 * children got removed.
 */
export const skip = Symbol("skip");
/**
 * The type of `skip`.
 */
export type Skip = typeof skip;
