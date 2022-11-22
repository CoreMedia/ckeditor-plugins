export const isNode = (value: unknown): value is Node => value instanceof Node;

/**
 * Parameters for `importNode´.
 */
export interface ImportNodeParams<T extends Node = Node> {
  /**
   * Document to import node to.
   */
  document: Document;
  /**
   * External node to import.
   */
  externalNode: T;
  /**
   * If to import node deeply.
   */
  deep?: boolean;
}

/**
 * Imports the given node into the new document.
 *
 * @param params - parameters
 */
const importNode = <T extends Node = Node>(params: ImportNodeParams<T>): T => {
  const { document, externalNode, deep } = params;
  return document.importNode<T>(externalNode, deep ?? false);
};
