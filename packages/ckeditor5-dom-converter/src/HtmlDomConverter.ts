import { isHasNamespaceUri } from "./dom/HasNamespaceUri";
import { isElement } from "./dom/Element";
import { isParentNode } from "./dom/ParentNode";

/**
 * The HTML DOM Converter is dedicated to XML grammars, that are closely related
 * to HTML. Typically, the counterpart offers a subset of elements and
 * attributes compare to HTML.
 *
 * This is an important restriction regarding DOM transformation, as some
 * candy during transformation only comes for HTML elements, such as access to
 * `classList` or `style` attributes. Any `class` attribute of a custom
 * namespace requires to be parsed manually (at least, if it has a
 * namespace prefix).
 */
export class HtmlDomConverter {
  /**
   * The target document to transform to.
   */
  readonly targetDocument: Document;
  /**
   * If the document (or better: its `documentElement`) have a default namespace
   * it is stored in here.
   *
   * This namespace is used during conversion, if an incoming node has the
   * same namespace as the default namespace of its document. It follows the
   * general idea to transform HTML-alike dialects in here back and forth.
   */
  readonly targetDefaultNamespaceUri: string | null;

  constructor(targetDocument: Document) {
    this.targetDocument = targetDocument;

    const { documentElement } = targetDocument;
    const { namespaceURI } = documentElement;

    let defaultNamespaceUri: string | null = null;
    if (namespaceURI !== null) {
      if (targetDocument.documentElement.isDefaultNamespace(namespaceURI)) {
        defaultNamespaceUri = namespaceURI;
      }
    }

    this.targetDefaultNamespaceUri = defaultNamespaceUri;
  }

  // Prio 1: Transform Data View to Data.
  convert(externalNode: Node): Node {
    const converted = this.#importNode(externalNode);
    if (isParentNode(converted)) {
      for (const child of externalNode.childNodes) {
        converted.append(this.convert(child));
      }
    }
    return converted;
  }

  #createElementNSFrom(externalElement: Element): Element {
    const { targetDocument } = this;
    const { namespaceURI, localName, prefix } = externalElement;
    if (prefix !== null) {
      // We don't translate the namespace for prefixed elements.
      return targetDocument.createElementNS(namespaceURI, `${prefix}:${localName}`);
    }
    const { ownerDocument } = externalElement;
    let newNamespaceUri: string | null = namespaceURI;
    if (ownerDocument.isDefaultNamespace(namespaceURI)) {
      // Default namespace of element without prefix:
      // Let's translate the namespace, as if the element now is part
      // of the target namespace.
      newNamespaceUri = this.targetDefaultNamespaceUri;
    }
    return targetDocument.createElementNS(newNamespaceUri, `${localName}`);
  }

  #createAttributeNSFrom(externalAttribute: Attr): Attr {
    const { targetDocument } = this;
    const { namespaceURI, localName, prefix, value } = externalAttribute;
    let newAttribute: Attr;
    if (prefix !== null) {
      // We don't translate the namespace for prefixed elements.
      newAttribute = targetDocument.createAttributeNS(namespaceURI, `${prefix}:${localName}`);
    } else {
      const { ownerDocument } = externalAttribute;
      let newNamespaceUri: string | null = namespaceURI;
      if (ownerDocument.isDefaultNamespace(namespaceURI)) {
        // Default namespace of element without prefix:
        // Let's translate the namespace, as if the element now is part
        // of the target namespace.
        newNamespaceUri = this.targetDefaultNamespaceUri;
      }
      newAttribute = targetDocument.createAttributeNS(newNamespaceUri, `${localName}`);
    }
    newAttribute.value = value;
    return newAttribute;
  }

  #importAttributesFrom(externalElement: Element, targetElement: Element): void {
    for (const externalAttribute of externalElement.attributes) {
      const newAttribute = this.#createAttributeNSFrom(externalAttribute);
      targetElement.setAttributeNodeNS(newAttribute);
    }
  }

  /**
   * Imports the given node (without children) into the target document.
   * Node and attributes of the same namespace as the source document will
   * be copied, as if they exist in the same way in the target namespace.
   * Nodes or attributes of foreign namespace will keep their original
   * namespace.
   *
   * Nodes without namespace and namespace-attributes are imported directly
   * via corresponding API.
   *
   * @param externalNode
   */
  #importNode<T extends Node = Node>(externalNode: T): T {
    if (isHasNamespaceUri(externalNode)) {
      if (isElement(externalNode)) {
        const newElement = this.#createElementNSFrom(externalNode);
        this.#importAttributesFrom(externalNode, newElement);
        return newElement as unknown as T;
      } else {
        // For now, we know, that this is an attribute due to the implementation
        // of isHasNamespaceUri.
        return this.#createAttributeNSFrom(externalNode) as unknown as T;
      }
    } else {
      // We know, that the node neither has a namespace nor (implicitly), that
      // it has `attributes`, which are only defined for `Element` which again
      // has a namespace. Thus, we can directly use the import API provided
      // via DOM.
      return this.targetDocument.importNode(externalNode, false);
    }
  }
}
