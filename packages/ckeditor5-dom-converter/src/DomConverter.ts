import { isParentNode } from "./dom/ParentNode";
import { isHasNamespaceUri } from "./dom/HasNamespaceUri";
import { createElementNS, CreateElementNS, CreateElementNSParams } from "./dom/Document";
import { isElement } from "./dom/Element";

/**
 * The DOM Converter converts DOM elements to corresponding elements based on
 * a set of rules to apply.
 */
export class DomConverter {
  /**
   * Document, which shall receive newly imported nodes.
   */
  readonly targetDocument: Document;

  /**
   * Cache of already imported nodes. Key is the external node and
   * value is the imported node.
   */
  readonly #importedNodeCache: WeakMap<Node, Node> = new WeakMap<Node, Node>();

  /**
   * Constructor.
   *
   * @param targetDocument - document to import to
   */
  constructor(targetDocument: Document) {
    this.targetDocument = targetDocument;
  }

  /**
   * Main method to convert a given node to another node. Note, that the
   * resulting node not necessarily is equal to the node to convert. It may,
   * for example, be an empty document fragment instead, that signals, that
   * the given node is ignored in target document.
   *
   * @param externalNode - external node to convert
   * @param deep - if to process children, too.
   */
  convert(externalNode: Node, deep = false): Node {
    try {
      // Don't propagate `deep` here, as we take care of the children
      // in here.
      const imported = this.importNode(externalNode, false);
      const processed = this.#processNode(externalNode, imported);

      if (deep && isParentNode(externalNode)) {
        for (const child of externalNode.childNodes) {
          // We may safely recurse into `convert` here, as possibly already
          // imported children are cached. Recursing here benefits from having
          // the same flow of import, process, finish.
          const convertedChild = this.convert(child, deep);
          imported.appendChild(convertedChild);
        }
      }

      return this.#finishNode(externalNode, processed);
    } finally {
      this.#importedNodeCache.delete(externalNode);
    }
  }

  /**
   * Creates an empty document fragment. During processing an empty document
   * fragment replacing a given node signals to eventually remove the node.
   */
  createDocumentFragment(): DocumentFragment {
    return this.targetDocument.createDocumentFragment();
  }

  /**
   * Creates an element for the target document of the converter.
   *
   * @param params - parameters
   */
  createElement(params: Omit<CreateElementNSParams, "document">): ReturnType<CreateElementNS> {
    return createElementNS({
      ...params,
      document: this.targetDocument,
    });
  }

  /**
   * Imports the given node to the target document. Caches already imported
   * nodes. If already imported, the already imported node is returned instead.
   *
   * @param externalNode - external node to import
   * @param deep - if to import a node deeply, thus, with its children
   */
  importNode(externalNode: Node, deep = false): Node {
    const { targetDocument } = this;

    const alreadyImported = this.#importedNodeCache.get(externalNode);
    if (alreadyImported) {
      return alreadyImported;
    }

    const imported = targetDocument.importNode(externalNode);
    this.#importedNodeCache.set(externalNode, imported);

    if (deep && isParentNode(externalNode)) {
      for (const child of externalNode.childNodes) {
        const importedChild = this.importNode(child, deep);
        imported.appendChild(importedChild);
      }
    }

    return imported;
  }

  /**
   * May apply final processing to a given node, which, if deep conversion
   * got request, now also contains the processed child nodes.
   *
   * Return an empty document fragment, to eventually remove the node from
   * the DOM.
   *
   * @param externalNode - external node the processed node originated from
   * @param processed - imported and processed node
   */
  #finishNode(externalNode: Node, processed: Node): Node {
    return processed;
  }

  /**
   * Processes a just imported node. Processing may replace a node, may remove
   * it (signalled by returned empty document fragment), etc. Only the given
   * node is being processed. For bulk operations on children the corresponding
   * `finishNode` is responsible.
   *
   * @param externalNode - external node to process
   * @param imported - imported node to process
   */
  #processNode(externalNode: Node, imported: Node): Node {
    // TODO: PoC - Should be done by rules later.
    if (isHasNamespaceUri(externalNode) && isHasNamespaceUri(imported)) {
      const externalNodeNamespace = externalNode.namespaceURI;
      const externalDocument = externalNode.ownerDocument;
      if (externalDocument.isDefaultNamespace(externalNodeNamespace)) {
        if (isElement(imported)) {
          /*
           * Already filter on importNode? Possibly not, as it may create a node
           * that is invalid for given namespace. So, what is a good transformation
           * process?
           * Early:
           *
           * * input: <xhtml:p xhtml:class="hurz" xhtml:data-something="hurz"/>
           * * import: <xhtml:p xhtml:class="hurz" xhtml:data-something="hurz"/>
           * * process:
           *   * createElement: <rt:p/>
           *   * migrateAttribute: <rt:p rt:class="hurz" xhtml:data-something="hurz"/> - or do we want to skip unknown properties here?
           * * Problem: If we transform early, we don't have `classList` support anymore. This is only available for HTML Elements.
           */
        }
      }
    }
    return imported;
  }
}
