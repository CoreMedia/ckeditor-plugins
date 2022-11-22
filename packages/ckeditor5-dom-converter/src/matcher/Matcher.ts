/**
 * Default match result type.
 */
export type DefaultMatchResultType = Record<string, unknown>;

/**
 * General Matcher interface.
 *
 * @param <T> - type of node
 * @param <R> - type of successful match result
 */
export interface Matcher<T extends Node = Node, R = DefaultMatchResultType> {
  match(node: T): false | R;
}
