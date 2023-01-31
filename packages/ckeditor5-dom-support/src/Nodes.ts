import { isHasNamespaceUri, isDocument, isElement } from "./TypeGuards";

const serializer = new XMLSerializer();

/**
 * Serialize given node to string.
 *
 * @param node - node to serialize
 */
export const serializeToXmlString = (node: Node): string => serializer.serializeToString(node);

/**
 * Extracts node contents from given node. All child-nodes will be removed
 * from the given node.
 *
 * @param node - node to extract node contents from
 * @returns fragment containing all child nodes
 */
export const extractNodeContents = (node: Node): DocumentFragment => {
  const { ownerDocument } = node;
  const range = ownerDocument?.createRange() ?? new Range();
  range.selectNodeContents(node);
  return range.extractContents();
};

/**
 * Moves contents from one node to another, appending them to the target node.
 *
 * @param source - source node to move from
 * @param target - target node to move to
 */
export const appendNodeContents = (source: Node, target: Node): void => {
  const fragment = extractNodeContents(source);
  if (isElement(target)) {
    target.append(fragment);
  } else {
    for (const child of fragment.childNodes) {
      target.appendChild(child);
    }
  }
};

/**
 * Moves contents from one node to another, prepending them to the target node.
 *
 * @param source - source node to move from
 * @param target - target node to move to
 */
export const prependNodeContents = (source: Node, target: Node): void => {
  const fragment = extractNodeContents(source);
  if (isElement(target)) {
    target.prepend(fragment);
  } else {
    const { firstChild } = target;
    for (const child of fragment.childNodes) {
      target.insertBefore(child, firstChild);
    }
  }
};

/**
 * This function takes a prefix as parameter and returns the namespace URI
 * associated with it on the given node if found (and null if not).
 *
 * Different to direct invocation of `node.lookupNamespaceURI` this method
 * applies a different behavior for an unset prefix (`null` or empty). Short,
 * it can be summarized as: Try again by retrieving `namespaceURI` from
 * `documentElement` and assume that this represents the default namespace,
 * unless `documentElement` is prefixed.
 *
 * In detail, this hides some implementation detail, that is different in
 * browsers (e.g., Chrome 109 vs. Firefox 109): While Chrome will almost never
 * return `null` for an empty prefix, Firefox will return `null` almost always
 * despite for an XML document with given prefix (tested for results of
 * `DOMParser.parseFromString()`).
 *
 * Thus, this function forwards to browser behavior, and intervenes, if
 * the fallback algorithm may provide a better result.
 *
 * For a non-empty prefix, the behavior is the same as
 * `node.lookupNamespaceURI`.
 *
 * @param node - node to lookup namespace URI at
 * @param prefix - prefix to look up; defaults to `null`
 * @param force - if `true` (defaults to `false`), always uses the fallback
 * algorithm for empty/unset prefix
 */
export const lookupNamespaceURI = (node: Node, prefix: string | "" | null = null, force = false): string | null => {
  const byBrowserApi = (): string | null => node.lookupNamespaceURI(prefix);

  if (prefix || force) {
    return byBrowserApi();
  }

  const byNodeNamespaceUri = (n: Node | null = node): string | null =>
    isHasNamespaceUri(n) ? (n.prefix ? null : n.namespaceURI) : null;
  const byDocumentElementNamespaceUri = (n: Node | null = node): string | null =>
    n ? (isDocument(n) ? byNodeNamespaceUri(n.documentElement) : byDocumentElementNamespaceUri(n.ownerDocument)) : null;

  return byBrowserApi() ?? byNodeNamespaceUri() ?? byDocumentElementNamespaceUri();
};

/**
 * Lookup default namespace URI for document.
 *
 * @param document - document to lookup default namespace URI (prefix: `null`) for.
 */
export const lookupDocumentDefaultNamespaceURI = (document: Document): string | null => lookupNamespaceURI(document);
