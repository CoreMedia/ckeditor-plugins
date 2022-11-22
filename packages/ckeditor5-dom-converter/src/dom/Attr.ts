/**
 * Type-guard if given value is an attribute instance `Attr`.
 * @param value - value to validate
 */
export const isAttr = (value: unknown): value is Document => value instanceof Attr;

/**
 * Parameters for creating attributes.
 */
export interface CreateAttributeParams {
  /**
   * Document to create attribute.
   */
  document: Document;
  /**
   * Optional namespace URI of attribute.
   */
  namespaceURI?: null | string;
  /**
   * Qualified name of attribute.
   */
  qualifiedName: string;
  /**
   * Optional value of attribute to set.
   */
  value?: string;
}

/**
 * Creates an attribute.
 *
 * @param params - parameters
 */
export const createAttribute = (params: CreateAttributeParams): Attr => {
  const { document, namespaceURI, qualifiedName, value } = params;
  const attribute = document.createAttributeNS(namespaceURI ?? null, qualifiedName);
  if (typeof value === "string") {
    attribute.value = value;
  }
  return attribute;
};
