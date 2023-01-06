import { isElement } from "@coremedia/ckeditor5-dom-support/Elements";
import { isAttr } from "@coremedia/ckeditor5-dom-support/Attrs";
import { isParentNode } from "@coremedia/ckeditor5-dom-support/ParentNodes";
import { skip, Skip } from "./Signals";
import { isCharacterData } from "@coremedia/ckeditor5-dom-support/CharacterDatas";
import { ConversionContext } from "./ConversionContext";
import { ConversionApi } from "./ConversionApi";

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
   * Context for conversion.
   */
  readonly api: ConversionApi;

  /**
   * Constructor.
   *
   * @param targetDocument - target document to transform to
   */
  constructor(targetDocument: Document) {
    this.api = new ConversionApi(targetDocument);
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
    const { api } = this;
    const context = new ConversionContext(originalNode, api);

    let result: Node | Skip;

    this.prepareForImport(originalNode, context);

    result = this.importedNode(api.importNode(originalNode), context);

    if (result === skip) {
      return;
    }

    if (isParentNode(originalNode)) {
      this.#convertChildren(originalNode, result);
      result = this.importedNodeAndChildren(result, context);

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
   * where the data view provides richer HTML API, such as `HTMLElement`
   * providing access to `dataset`.
   *
   * There is no need when overriding to call the `super` method as it is
   * a no-operation method.
   *
   * This method must not detach the original node from DOM or relocate it.
   *
   * @param originalNode - original (mutable!) node
   * @param context - current conversion context
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected prepareForImport(originalNode: Node, context: ConversionContext): void {
    // No operation by default.
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
   * @param context - current conversion context
   * @returns the node to continue with in further processing or a signal
   * what to do instead
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected importedNode(importedNode: Node, context: ConversionContext): Node | Skip {
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
   * @param context - current conversion context
   * @returns the node to attach to the DOM eventually; or a corresponding
   * signal what to do instead
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected importedNodeAndChildren(importedNode: Node, context: ConversionContext): Node | Skip {
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
}
