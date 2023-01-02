/**
 * Type-Guard for DOM `DocumentFragment`.
 *
 * @param value - value to guard
 */
export const isDocumentFragment = (value: unknown): value is DocumentFragment => value instanceof DocumentFragment;

/**
 * Extracts `DocumentFragment` from contents of given node.
 *
 * @param value - node to extract `DocumentFragment` from
 */
export const fragmentFromNodeContents = (value: Node): DocumentFragment => {
  const { ownerDocument } = value;
  const range = ownerDocument?.createRange() ?? new Range();
  range.selectNodeContents(value);
  return range.extractContents();
};
