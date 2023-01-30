/**
 * Artificial type for nodes providing a `namespaceURI`.
 */
export type HasNamespaceUri = Pick<Attr | Element, "namespaceURI"> & (Attr | Element);

/**
 * Artificial type for `ParentNode` enriched by explicit types for classes
 * `Document`, `DocumentFragment` and `Element`, which may help in type
 * narrowing.
 */
export type HasChildren = ParentNode & (Document | DocumentFragment | Element);
