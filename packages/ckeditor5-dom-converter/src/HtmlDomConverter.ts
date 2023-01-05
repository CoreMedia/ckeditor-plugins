import { isHasNamespaceUri } from "@coremedia/ckeditor5-dom-support/HasNamespaceUris";
import { isElement } from "@coremedia/ckeditor5-dom-support/Elements";
import { isAttr } from "@coremedia/ckeditor5-dom-support/Attrs";
import { isParentNode } from "@coremedia/ckeditor5-dom-support/ParentNodes";
import { skip, Skip } from "./Signals";
import { isCharacterData } from "@coremedia/ckeditor5-dom-support/CharacterDatas";

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
   * nodes; `undefined` if the node is to be ignored in target document.
   */
  convert(originalNode: Node): Node | undefined {
    let result: Node | Skip;

    this.prepareForImport(originalNode);

    result = this.importedNode(this.#importNode(originalNode));

    if (result === skip) {
      return;
    }

    if (isParentNode(originalNode)) {
      this.#convertChildren(originalNode, result);
      result = this.importedNodeAndChildren(result);

      if (result === skip) {
        return;
      }
    }

    return result;
  }

  /**
   * Prior to importing the original node, you may want to modify it. Note,
   * that allowed modification is limited, though. Expected use-cases are:
   *
   * * Modify attributes prior to import.
   * * Modify children prior to import.
   *
   * This method is especially useful for data view to data transformation,
   * where the data view is the much richer HTML API, such as `HTMLElement`
   * providing access to `dataset`.
   *
   * There is no need when overriding to call the `super` method as it is
   * a no-operation method.
   *
   * @param originalNode - original (mutable!) node
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected prepareForImport(originalNode: Node): void {
    // No operation by default.
  }

  /**
   * Creates a document fragment owned by `targetDocument`. Meant as utility
   * method for subclasses. May be used in use-cases such as replacing a node
   * by only its child nodes.
   */
  protected createDocumentFragment(): DocumentFragment {
    // TODO: We may want to make this public, so that rules may access this
    //   method.
    return this.targetDocument.createDocumentFragment();
  }

  /**
   * Provides the possibility to handle a just imported node. The node is
   * neither attached to DOM yet, nor children are available.
   *
   * **Default Behavior:** No operation by default, thus, just returning the
   * `importedNode`. Overrides may safely skip call to `super`.
   *
   * **Implementation Notes:**
   *
   * * Just exchanging one node with another of a similar (high-level)
   *   type is considered harmless. Thus, if an element becomes an
   *   element, this is in general safe despite possible implications
   *   towards a document valid by schema. Such invalid states may be
   *   fixed in later processing, though.
   *
   * * In general, it is not recommended to exchange a `ParentNode` with
   *   some node, that may not hold any children in this stage, as children
   *   will not be handled at all. Better do so in later processing.
   *
   * * You may _expand_ a given node to a set of nodes by returning
   *   a `DocumentFragment` instead. Note, though, that in this stage
   *   subsequent child nodes will be appended to this `DocumentFragment`
   *   which may be unexpected. In general such _expansion_ should be done
   *   at a later stage.
   *
   * * To ignore this node, but still process the children, you may return
   *   an empty `DocumentFragment` instead.
   *
   * * To skip all further processing of this node (and not child nodes, as they
   *   have not been handled yet), you may signal this by providing the `skip`
   *   signal.
   *
   * * If you want to replace, for example, an element by just some
   *   character data, it is recommended to do this in later processing
   *   when also the children have been processed. Otherwise, ensure
   *   you understand possible implications doing this in this early stage,
   *   such as that children not being converted to CharacterData are
   *   ignored, and that CharacterData are just appended without taking
   *   the actual type of data into account.
   *
   * * When transforming from HTML to XML, you may experience a rather
   *   limited API for `importedNode` compared to the original node.
   *   Like in XML there is no `HTMLElement.dataset`. Dealing with this
   *   richer API is best done in setup phase by overriding
   *   `prepareForImport`. Here you may modify the DOM with some restrictions
   *   to ease further processing.
   *
   * @param importedNode - the just imported node
   * @returns the node to continue with in further processing or a signal
   * what to do instead
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected importedNode(importedNode: Node): Node | Skip {
    return importedNode;
  }

  /**
   * Provides the opportunity to handle a just imported node, having its
   * children processed. The node is not attached to the DOM yet, though.
   *
   * **Default Behavior:** No operation by default, thus, just returning the
   * `importedNode`. Overrides may safely skip call to `super`.
   *
   * **Implementation Notes:**
   *
   * * To replace a node by its children, you may return a `DocumentFragment`
   *   with the corresponding children here.
   *
   * * Returning `skip` is semantically similar to returning an empty
   *   `DocumentFragment`. Exception: `skip` prevents further processing
   *   completely whereas a `DocumentFragment` still signals to have been
   *   attached to DOM.
   *
   * @param importedNode - imported node, possibly with children
   * @returns the node to attach to the DOM eventually; or a corresponding
   * signal what to do instead
   */
  protected importedNodeAndChildren(importedNode: Node): Node | Skip {
    return importedNode;
  }

  /**
   * Converts all children of parent node. Expected child node types after
   * conversion are:
   *
   * * `Attr` – will be set as attribute to `importedNode`
   * * `CharacterData` – will be appended
   * * `DocumentFragment` – all elements will be appended
   * * `Element` – will be appended
   * * `undefined`– child will be ignored
   *
   * @param originalNode - the original node, whose children need to be imported
   * and converted
   * @param importedNode - the just imported (parent) node, neither attached
   * to DOM yet nor having any children yet
   */
  #convertChildren(originalNode: ParentNode, importedNode: Node): void {
    if (isAttr(importedNode)) {
      // Skip fast on discouraged conversion states, thus, nodes, which
      // cannot hold children or attributes.
    }
    for (const child of originalNode.childNodes) {
      const convertedChild = this.convert(child);
      if (convertedChild) {
        this.appendChild(importedNode, convertedChild);
      }
    }
  }

  /**
   * Called to append a just imported child node to its parent.
   *
   * This method is called, when the original node was a parent node having
   * children.
   *
   * Note, that processing may have transformed the original parent node to
   * a non-parent node (such as `CharacterData`). While this is rather
   * unexpected, the default implementation handles this case at least when
   * also the imported child is `CharacterData` by appending these data
   * to the parent. Such behavior may signal some misbehavior in processing.
   *
   * For implementing classes, the method signals, if it successfully handled
   * the child. A return value of `false` signals, that the child was not
   * handled in any way **and** that subclasses may decide to do different.
   * A subclass may return **true** although the child was not added: This
   * would signal, that the node got ignored by intention, like a node, which
   * is not allowed as child to the given parent node in target document.
   *
   * Similar to the `imported*` methods, this method may be overridden to
   * control appending child nodes to parents. Different to those methods,
   * it is strongly recommended calling the `super` method when overriding.
   *
   * @param importedParentNode - the node to append the child to
   * @param importedChildNode - the just imported child node to append
   * @returns `true` if the child node has been handled; `false` if it is not
   * and subclasses may decide to take the responsibility for handling them
   */
  protected appendChild(importedParentNode: Node, importedChildNode: Node): boolean {
    if (isParentNode(importedParentNode)) {
      if (isAttr(importedChildNode)) {
        if (isElement(importedParentNode)) {
          /*
           * This allows, for example, to handle attributes being encoded as
           * elements. Such as transforming:
           *
           * ```xml
           * <em><span class="data-voice">female</span>Hello!</em>
           * ```
           *
           * to
           *
           * ```xml
           * <em data-voice="female">Hello!</em>
           * ```
           */
          importedParentNode.setAttributeNodeNS(importedChildNode);
          return true;
        }
        return false;
      }

      // The 98% behavior for dealing with child nodes.
      importedParentNode.append(importedChildNode);
      return true;
    } else if (isCharacterData(importedParentNode)) {
      /*
       * While rather unexpected, we do our best here to handle this state.
       * We reached this state, when the original node was a ParentNode
       * but got transformed to `CharacterData` instead.
       * It is better to perform a transformation of `importedNode` to
       * `CharacterData` when all children have been processed.
       * As alternative, previous processing could have created a
       * `DocumentFragment` as replacement, which holds the character
       * data derived from the `originalNode`.
       */
      if (isCharacterData(importedChildNode)) {
        importedParentNode.appendData(importedChildNode.data);
        return true;
      }
    }

    return false;
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
