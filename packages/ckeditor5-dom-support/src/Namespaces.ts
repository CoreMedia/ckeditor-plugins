/**
 * Namespace URI for `xmlns`.
 */
export const xmlnsNamespaceUri = "http://www.w3.org/2000/xmlns/";

/**
 * Registers the given namespace prefix at the root document element.
 *
 * @param ownerDocument - document to register namespace at its document element
 * @param prefix - prefix to register
 * @param namespaceUri - namespace URI to register
 */
export const registerNamespacePrefixAtDocumentElement = (
  ownerDocument: Document,
  prefix: string,
  namespaceUri: string
): void => {
  ownerDocument.documentElement.setAttributeNS(xmlnsNamespaceUri, `xmlns:${prefix}`, namespaceUri);
};

/**
 * Registers namespace prefixes globally at document element.
 *
 * @param ownerDocument - owner document, where to add namespace declarations
 * to its document element
 */
export const globallyRegisterNamespacePrefixes = (ownerDocument: Document): void => {
  const processNamespacedNode = (node: Attr | Element) => {
    const { prefix, namespaceURI } = node;
    if (prefix && namespaceURI) {
      registerNamespacePrefixAtDocumentElement(ownerDocument, prefix, namespaceURI);
    }
  };
  const processElement = (el: Element) => {
    processNamespacedNode(el);
    for (const attr of el.attributes) {
      processNamespacedNode(attr);
    }
  };
  ownerDocument.querySelectorAll("*").forEach(processElement);
};
