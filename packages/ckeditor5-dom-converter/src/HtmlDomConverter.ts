import { isElement } from "@coremedia/ckeditor5-dom-support/Elements";
import { isAttr } from "@coremedia/ckeditor5-dom-support/Attrs";
import { isParentNode } from "@coremedia/ckeditor5-dom-support/ParentNodes";
import { skip, Skip } from "./Signals";
import { isCharacterData } from "@coremedia/ckeditor5-dom-support/CharacterDatas";
import { ConversionContext } from "./ConversionContext";
import { ConversionApi } from "./ConversionApi";
import { isDocumentFragment } from "@coremedia/ckeditor5-dom-support/DocumentFragments";

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

    // Context is irrelevant in this stage: The source node is the same
    // as the one given here and the convenience API is bound to the target
    // document and thus irrelevant for modifying the DOM of the original
    // node.
    this.prepareForImport(originalNode);

    result = this.imported(api.importNode(originalNode), context);

    if (result === skip) {
      return;
    }

    if (isParentNode(originalNode)) {
      this.#convertChildren(originalNode, result, context);
      result = this.importedWithChildren(result, context);

      if (result === skip) {
        return;
      }
    }

    return result;
  }

  /**
   * Prior to importing the original node, you may want to modify it. Note,
   * that allowed modification is limited, though.
   *
   * There is no need when overriding to call the `super` method as it is
   * a no-operation method.
   *
   * This method must not detach the original node from DOM or relocate it.
   *
   * @param originalNode - original (mutable!) node
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected prepareForImport(originalNode: Node): void {
    // No operation by default.
  }

  /**
   * Provides the possibility to handle a just imported node. The node is
   * neither attached to DOM yet, nor children are available.
   *
   * **Default Behavior:** No operation by default, thus, just returning the
   * `importedNode`. Overrides may safely skip call to `super`.
   *
   * @param importedNode - the just imported node
   * @param context - current conversion context
   * @returns the node to continue with in further processing or a signal
   * what to do instead
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected imported(importedNode: Node, context: ConversionContext): Node | Skip {
    return importedNode;
  }

  /**
   * Provides the opportunity to handle a just imported node, having its
   * children processed. The node is not attached to the DOM yet, though.
   *
   * **Default Behavior:** No operation by default, thus, just returning the
   * `importedNode`. Overrides may safely skip call to `super`.
   *
   * @param importedNode - imported node, possibly with children
   * @param context - current conversion context
   * @returns the node to attach to the DOM eventually; or a corresponding
   * signal what to do instead
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected importedWithChildren(importedNode: Node, context: ConversionContext): Node | Skip {
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
   * @param context - current conversion context
   */
  #convertChildren(originalNode: ParentNode, importedNode: Node, context: ConversionContext): void {
    if (isAttr(importedNode)) {
      // Skip fast on discouraged conversion states, thus, nodes, which
      // cannot hold children or attributes.
    }
    for (const child of originalNode.childNodes) {
      const convertedChild = this.convert(child);
      if (convertedChild) {
        if (isDocumentFragment(convertedChild)) {
          // Special handling for notification purpose, as the standard
          // process will pass an empty fragment as `convertedChild`
          // after appending.
          const fragmentContents = [...convertedChild.childNodes];
          if (this.appendChild(importedNode, convertedChild)) {
            fragmentContents.forEach((content) => this.appended(importedNode, content, context));
          }
        }
        if (this.appendChild(importedNode, convertedChild)) {
          this.appended(importedNode, convertedChild, context);
        }
      }
    }
  }

  /**
   * Called as soon as a node got attached to the DOM.
   *
   * **Note on `context`:** The source node references the related
   * representation of `parentNode` in the original document.
   *
   * The default implementation is empty. Thus, no super call required on
   * override.
   *
   * @param parentNode - parent node child got appended to
   * @param childNode - child node that got appended
   * @param context - current conversion context
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected appended(parentNode: Node, childNode: Node, context: ConversionContext): void {
    // No operation by default.
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
