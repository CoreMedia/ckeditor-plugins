import { copyAttributesFrom } from "./Attrs";
import { lookupDocumentDefaultNamespaceURI } from "./Nodes";
export { isElement } from "./TypeGuards";

/**
 * Represents an element to create.
 */
export interface ElementDefinition {
  /**
   * The target namespace URI.
   * Note, that `undefined` will signal to use the document's
   * namespace URI, while `null` enforces empty namespace.
   */
  namespaceURI?: null | string;
  /**
   * The qualified name of the element to create.
   */
  qualifiedName: string;
}

/**
 * Possible representations of an element to create. It is either only the
 * qualified name (`string`) or a definition along with the corresponding
 * namespace URI (`ElementDefinition`).
 */
export type ElementDefinitionType = string | ElementDefinition;

/**
 * Transforms a given definition to its `ElementDefinition`.
 *
 * @param definition - definition to transform
 */
export const compileElementDefinition = (definition: ElementDefinitionType): ElementDefinition => {
  if (typeof definition === "string") {
    return { qualifiedName: definition };
  }
  return definition;
};

/**
 * Creates an element based on the given definition.
 *
 * @param ownerDocument - document to create element
 * @param definition - definition of element to create.
 */
export const createElement = (ownerDocument: Document, definition: ElementDefinitionType): Element => {
  const { namespaceURI, qualifiedName } = compileElementDefinition(definition);
  let newNamespaceURI = namespaceURI;
  if (newNamespaceURI === undefined) {
    // Decision note: Not using the document's namespace here, would result
    // in elements having empty namespace instead, serialized to, for example,
    // `<created xmlns=""/>`. Using the document's namespace seems to be the
    // more expected behavior, which is, `<created/>` as serialized XML.
    // Sticking to tri-state here, thus `null` will not trigger this behavior,
    // as it may be intended behavior to create this empty namespace.
    newNamespaceURI = lookupDocumentDefaultNamespaceURI(ownerDocument);
  }
  return document.createElementNS(newNamespaceURI, qualifiedName);
};

/**
 * Renames the given element. New and original element will be owned by the
 * same document.
 *
 * **Attributes:** All attributes are transferred to renamed element.
 *
 * **Parent:** If the original element was attached to some parent, it is
 * automatically replaced by the new element.
 *
 * **Post-Condition:** The original element is being modified. This method
 * does not make any guarantees regarding its state, thus, the original element
 * should not be used anymore.
 *
 * **Children:** By default (`keepChildren` set to `true`), the transformation
 * respects child nodes in that way, that they are moved to the new element
 * (and thus, detached from original element). If set to `false` child  nodes
 * are not transferred, thus the new renamed node is empty.
 *
 * @param originalElement - original element to rename
 * @param definition - definition how to rename the element
 * @param keepChildren - if to keep, thus transfer child nodes to new element;
 * defaults to `true`
 * @returns renamed element
 */
export const renameElement = (
  originalElement: Element,
  definition: ElementDefinitionType,
  keepChildren = true
): Element => {
  const newElement = createElement(originalElement.ownerDocument, definition);

  if (keepChildren) {
    for (const childNode of originalElement.childNodes) {
      newElement.append(childNode);
    }
  }

  copyAttributesFrom(originalElement, newElement);

  originalElement.replaceWith(newElement);

  return newElement;
};

/**
 * Removes the given class from element. In contrast to
 * `element.classList.remove(...)` it also ensures to remove the `class`
 * attribute, if empty.
 *
 * May be used to clean up class-attribute providing no tokens at all.
 *
 * @param element - element to remove class from
 * @param tokens - class names to remove
 */
export const removeClass = <T extends Element>(element: T, ...tokens: string[]): T => {
  element.classList.remove(...tokens);
  if (element.classList.length === 0) {
    element.removeAttribute("class");
  }
  return element;
};
