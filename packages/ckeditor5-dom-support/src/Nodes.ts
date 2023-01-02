const serializer = new XMLSerializer();

/**
 * Serialize given node to string.
 *
 * @param node - node to serialize
 */
export const serializeToXmlString = (node: Node): string => serializer.serializeToString(node);
