import { isElement } from "@coremedia/ckeditor5-dom-support/Elements";
import { isAttr } from "@coremedia/ckeditor5-dom-support/Attrs";

/**
 * Contextual information and API during DOM conversion.
 */
export class ConversionApi {
  readonly targetDocument: Document;
  readonly targetDefaultNamespaceURI: string | null;

  constructor(targetDocument: Document) {
    this.targetDocument = targetDocument;
    this.targetDefaultNamespaceURI = this.targetDocument.lookupNamespaceURI(null);
  }

  createAttribute(localName: string): Attr {
    return this.createAttributeNS(this.targetDefaultNamespaceURI, localName);
  }

  createAttributeNS(namespaceURI: string | null, qualifiedName: string): Attr {
    const { targetDocument } = this;
    return targetDocument.createAttributeNS(namespaceURI, qualifiedName);
  }

  /**
   * Creates an empty `DocumentFragment` owned by `targetDocument`.
   */
  createDocumentFragment(): DocumentFragment {
    const { targetDocument } = this;
    return targetDocument.createDocumentFragment();
  }

  /**
   * Creates the element with given local name with default namespace of
   * target document.
   *
   * @param localName - local name of element to create
   */
  createElement(localName: string): Element {
    return this.createElementNS(this.targetDefaultNamespaceURI, localName);
  }

  /**
   * Forwards to `createElementNS` in targetDocument.
   *
   * @param namespaceURI - namespace URI
   * @param qualifiedName - qualified name of element to create
   */
  createElementNS(namespaceURI: string | null, qualifiedName: string): Element {
    const { targetDocument } = this;
    return targetDocument.createElementNS(namespaceURI, qualifiedName);
  }

  #hasDefaultNamespace(node: Element | Attr): boolean {
    if (node.prefix) {
      return false;
    }
    const defaultNamespaceURI = node.ownerDocument.lookupNamespaceURI(null);
    return node.namespaceURI === defaultNamespaceURI;
  }

  #importAttr(attr: Attr): Attr | undefined {
    if (!this.#hasDefaultNamespace(attr)) {
      return;
    }
    const imported = this.createAttribute(attr.localName);
    imported.value = attr.value;
    return imported;
  }

  #importElement(element: Element, deep = false): Element | undefined {
    if (!this.#hasDefaultNamespace(element)) {
      return;
    }

    const imported = this.createElement(element.localName);

    for (const attribute of element.attributes) {
      const importedAttribute = this.#importAttr(attribute) ?? this.#importNode(attribute);
      imported.setAttributeNodeNS(importedAttribute);
    }

    if (deep) {
      for (const child of element.childNodes) {
        const importedChild = this.importNode(child);
        imported.append(importedChild);
      }
    }

    return imported;
  }

  #importNode<T extends Node>(node: T, deep = false): T {
    return this.targetDocument.importNode(node, deep);
  }

  importNode(node: Node, deep = false): Node {
    if (isElement(node)) {
      return this.#importElement(node, deep) ?? this.#importNode(node, deep);
    }
    if (isAttr(node)) {
      return this.#importAttr(node) ?? this.#importNode(node, deep);
    }

    return this.#importNode(node, deep);
  }
}
