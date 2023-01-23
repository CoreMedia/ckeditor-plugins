import { isDocument } from "./Documents";

/**
 * Namespace URI for `xmlns`.
 */
export const xmlnsNamespaceUri = "http://www.w3.org/2000/xmlns/";

/**
 * Registers namespace prefixes of document (recursively) or
 * element (non-recursive) to given target element. If target element is unset
 * it falls back to the `documentElement` (of `ownerDocument`, if element is
 * given).
 *
 * @param documentOrElement - the document to analyze recursively or the element
 * to analyze non-recursively.
 * @param targetElement - the element, that shall receive the prefixed namespace
 * declarations; defaults applied according to description.
 */
export const registerNamespacePrefixes = (documentOrElement: Document | Element, targetElement?: Element): void => {
  if (isDocument(documentOrElement)) {
    const target = targetElement ?? documentOrElement.documentElement;
    documentOrElement.querySelectorAll("*").forEach((el) => registerNamespacePrefixes(el, target));
    return;
  }

  const element = documentOrElement;
  const { ownerDocument } = element;

  const target = targetElement ?? ownerDocument?.documentElement;

  if (!target) {
    throw new Error(
      "Illegal State: Either given element to analyze must by attached to DOM or a targetElement must be provided."
    );
  }

  if (target.isSameNode(element)) {
    return;
  }

  const processNamespacedNode = (node: Attr | Element) => {
    const { prefix, namespaceURI } = node;
    if (prefix && namespaceURI) {
      target.setAttributeNS(xmlnsNamespaceUri, `xmlns:${prefix}`, namespaceURI);
    }
  };

  processNamespacedNode(element);
  for (const attr of element.attributes) {
    processNamespacedNode(attr);
  }
};
