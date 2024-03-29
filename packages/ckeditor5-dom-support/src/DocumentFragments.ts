export { isDocumentFragment } from "./TypeGuards";

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

/**
 * Provides a string representation of a given document fragment,
 * concatenating string representations of its children.
 *
 * @param domFragment - fragment to create `toString` representation of
 */
export const fragmentToString = (domFragment: DocumentFragment): string =>
  Array.from(domFragment.childNodes)
    .map((cn) => (cn as Element).outerHTML || cn.nodeValue)
    .reduce((result, s) => (result ?? "") + (s ?? ""), "") ?? "";
