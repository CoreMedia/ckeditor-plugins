import { isHasNamespaceUri } from "@coremedia/ckeditor5-dom-support/HasNamespaceUris";
import { isElement } from "@coremedia/ckeditor5-dom-support/Elements";
import { isAttr } from "@coremedia/ckeditor5-dom-support/Attrs";
import { isParentNode } from "@coremedia/ckeditor5-dom-support/ParentNodes";

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

  /**
   * Constructor.
   *
   * @param targetDocument - target document to transform to
   */
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

  /**
   * Converts the given node and its children to the target
   * document. The processing is performed in this order:
   *
   * 1. **imported:** Node is imported into current document, possibly
   *    transforming default namespace towards the new document default.
   *    In post-processing the imported node may be replaced by a new
   *    node.
   * 2. **post-process imported:** An optional post-processing may now
   *    replace the given node.
   * 3. **finish:** In the end, node conversion is finished, providing a
   *    last option for transforming a node and even removing it.
   *
   * @param originalNode - node to convert
   * @returns the imported, not yet attached, node along with converted child
   * nodes
   */
  convert(originalNode: Node): Node | undefined {
    const imported = this.#importNode(originalNode);
    const postProcessed = this.postProcessImportedNode(originalNode, imported);
    return postProcessed ? this.finishNodeConversion(originalNode, postProcessed) : undefined;
  }

  /**
   * A single node got imported along with its attributes (but without its
   * children). Subclasses may decide to apply further transformations
   * here to the given node.
   *
   * The default behavior returns the imported node and possibly processed and
   * attached child nodes. Child node processing is only applied, if both,
   * the original and the new imported node are parent nodes.
   *
   * **Notes on attributes handling:**
   *
   * * In general incoming attributes are expected to be handled in context of
   *   their owning elements, as previous processing already transferred all
   *   attributes to the imported node. Only exception here, if `convert` got
   *   called with an attribute.
   * * In contrast to this, if the conversion of a child element results in
   *   an attribute node, this attribute is applied to the imported node. This
   *   also means, that such transformation approach "child node to attribute"
   *   may override attributes set in previous import stage.
   *
   * @param originalNode - original node being processed
   * @param importedNode - imported node, not attached to a parent yet
   * @returns possibly replaced node; `importedNode` by default; `undefined`
   * if the node (and all its children) is removed/ignored.
   */
  protected postProcessImportedNode<T extends Node = Node>(originalNode: T, importedNode: T): Node | undefined {
    // DevNote Generics: While we may use `Node` as concrete parameter type,
    // the generics approach especially signals, that in this stage original
    // node and imported node are of the same type. Post-processing is the first
    // stage where this may change.
    if (isParentNode(originalNode)) {
      for (const child of originalNode.childNodes) {
        const convertedChild = this.convert(child);
        if (convertedChild) {
          if (isAttr(convertedChild) && isElement(importedNode)) {
            importedNode.setAttributeNodeNS(convertedChild);
          } else if (isParentNode(importedNode)) {
            // Depending on conversion, we may, for example, end up here having
            // an attribute trying to be appended to an element. This would
            // signal an invalid conversion strategy in subclasses. We do not
            // prevent this state here but leave it to the DOM API to possibly
            // raise an error.
            importedNode.append(convertedChild);
          }
        }
      }
    }
    return importedNode;
  }

  /**
   * Finish conversion, after a node has been imported and post-processed.
   * In default behavior, you may expect the node being converted to target
   * namespace, all attributes being transferred and, if the node was a parent
   * node, all its children being processed and attached to the node.
   *
   * Still, in this late stage, final post-processing may decide to remove
   * the node. For example, when a node has no children anymore after previous
   * processing.
   *
   * @param originalNode - external node converted
   * @param importedNode - imported node, possible children already being
   * processed and attached
   * @returns possibly replaced node; `importedNode` by default; `undefined`
   * if the node is removed/ignored.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected finishNodeConversion(originalNode: Node, importedNode: Node): Node | undefined {
    return importedNode;
  }

  /**
   * Creates an element in target document, which is similar to the one
   * passed as argument. Neither attributes nor children are handled in
   * here.
   *
   * @param originalElement - external element to create a similar element from
   * @returns newly created element
   */
  #createElementNSFrom<T extends Element = Element>(originalElement: T): T {
    const { targetDocument } = this;
    const { namespaceURI, localName, prefix } = originalElement;
    if (prefix !== null) {
      // We don't translate the namespace for prefixed elements.
      return targetDocument.createElementNS(namespaceURI, `${prefix}:${localName}`) as T;
    }
    const { ownerDocument } = originalElement;
    let newNamespaceUri: string | null = namespaceURI;
    if (ownerDocument.isDefaultNamespace(namespaceURI)) {
      // Default namespace of element without prefix:
      // Let's translate the namespace, as if the element now is part
      // of the target namespace.
      newNamespaceUri = this.targetDefaultNamespaceUri;
    }
    return targetDocument.createElementNS(newNamespaceUri, `${localName}`) as T;
  }

  /**
   * Creates an attribute in target document, which is similar to the one
   * passed as argument.
   *
   * @param originalAttribute - external attribute to create a similar one from
   * @returns newly created attribute
   */
  #createAttributeNSFrom(originalAttribute: Attr): Attr {
    const { targetDocument } = this;
    const { namespaceURI, localName, prefix, value } = originalAttribute;
    let newAttribute: Attr;
    if (prefix !== null) {
      // We don't translate the namespace for prefixed elements.
      newAttribute = targetDocument.createAttributeNS(namespaceURI, `${prefix}:${localName}`);
    } else {
      const { ownerDocument } = originalAttribute;
      let newNamespaceUri: string | null = namespaceURI;
      if (ownerDocument.isDefaultNamespace(namespaceURI)) {
        // Default namespace of element without prefix:
        // Let's translate the namespace, as if the attribute now is part
        // of the target namespace.
        newNamespaceUri = this.targetDefaultNamespaceUri;
      }
      newAttribute = targetDocument.createAttributeNS(newNamespaceUri, `${localName}`);
    }
    newAttribute.value = value;
    return newAttribute;
  }

  /**
   * Imports all attributes from given external element into the target
   * element.
   *
   * @param externalElement - external element to copy attributes from
   * @param targetElement - element that receives attributes
   */
  #importAttributesFrom(externalElement: Element, targetElement: Element): void {
    for (const originalAttribute of externalElement.attributes) {
      // Not using `convert` here: While it may seem suitable calling
      // `convert` here, it would collide with the alternative `importNode`
      // called on `targetDocument`. As the alternative path just exists, to
      // align default namespaces, we should behave similar to `importNode`
      // here, not doing any fancy conversion.
      const newAttribute = this.#importNode(originalAttribute);
      targetElement.setAttributeNodeNS(newAttribute);
    }
  }

  /**
   * Imports the given node (flat, thus, without children) into the target
   * document. Node and attributes of the same namespace as the source document
   * will be copied, as if they exist in the same way in the target namespace.
   * Nodes or attributes of foreign namespace will keep their original
   * namespace.
   *
   * Nodes without namespace and namespace-attributes are imported directly
   * via corresponding API.
   *
   * @param originalNode - external node to import
   */
  #importNode<T extends Node = Node>(originalNode: T): T {
    if (isHasNamespaceUri(originalNode)) {
      // Manual `importNode`: Purpose is to automatically align default
      // namespaces: If the original node is of the default namespace of
      // the originating document, it is now transferred to the default
      // namespace of the target document.
      if (isElement(originalNode)) {
        const newElement = this.#createElementNSFrom(originalNode);
        // As `importNode` also handles attributes, we need to do this here,
        // too.
        this.#importAttributesFrom(originalNode, newElement);
        return newElement;
      } else if (isAttr(originalNode)) {
        // For now, we know, that this is an attribute due to the implementation
        // of isHasNamespaceUri.
        return this.#createAttributeNSFrom(originalNode) as unknown as T;
      }
    }
    // Use default `importNode` instead, of the above is not applicable.
    return this.targetDocument.importNode(originalNode, false);
  }
}
