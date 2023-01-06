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
    return this.targetDocument.createAttributeNS(namespaceURI, qualifiedName);
  }

  /**
   * Creates a CDATA section owned by `targetDocument`.
   *
   * @param data - CDATA text
   */
  createCDATASection(data: string): CDATASection {
    return this.targetDocument.createCDATASection(data);
  }

  /**
   * Creates a Comment owned by `targetDocument`.
   *
   * @param data - text
   */
  createComment(data: string): Comment {
    return this.targetDocument.createComment(data);
  }

  /**
   * Creates an empty `DocumentFragment` owned by `targetDocument`.
   */
  createDocumentFragment(): DocumentFragment {
    return this.targetDocument.createDocumentFragment();
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
    return this.targetDocument.createElementNS(namespaceURI, qualifiedName);
  }

  /**
   * Creates a `Range` owned by `targetDocument`.
   */
  createRange(): Range {
    return this.targetDocument.createRange();
  }

  /**
   * Creates a Text node owned by `targetDocument`.
   *
   * @param data - text
   */
  createTextNode(data: string): Text {
    return this.targetDocument.createTextNode(data);
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

  /**
   * Forwards to `importNode` of target document.
   *
   * @param node - node to import
   * @param deep - if to include child nodes
   */
  #importNode<T extends Node>(node: T, deep = false): T {
    return this.targetDocument.importNode(node, deep);
  }

  /**
   * Imports nodes similar to `Document.importNode`. In contrast to
   * `Document.importNode´ this method tries to also adapt the namespace
   * URIs of corresponding nodes: If they were of the default namespace in
   * the source document, they will now use the default namespace of the
   * target document.
   *
   * @param node - node to import
   * @param deep - if to include children; defaults to `false`.
   */
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
