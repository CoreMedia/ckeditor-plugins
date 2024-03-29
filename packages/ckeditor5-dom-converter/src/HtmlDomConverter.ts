import {
  isElement,
  isAttr,
  isParentNode,
  isCharacterData,
  fragmentToString,
  isDocumentFragment,
} from "@coremedia/ckeditor5-dom-support";
import { skip, Skip } from "./Signals";
import { ConversionContext } from "./ConversionContext";
import { ConversionApi } from "./ConversionApi";
import { Logger, LoggerProvider } from "@coremedia/ckeditor5-logging";
import { ConversionListener } from "./ConversionListener";

const nodeToString = (node: Node | null | undefined): string => {
  if (!node) {
    return `${node}`;
  }
  if (isDocumentFragment(node)) {
    return `${node.nodeName}: type: ${node.nodeType}, contents: ${fragmentToString(node)}`;
  }
  if (isElement(node)) {
    return `<${node.localName}>: prefix: ${node.prefix}, namespaceURI: ${node.namespaceURI}, outerHTML: ${node.outerHTML}`;
  } else {
    return `${node.nodeName}: type: ${node.nodeType}`;
  }
};

/**
 * The HTML DOM Converter is dedicated to XML grammars, that are closely related
 * to HTML. Typically, the counterpart offers a subset of elements and
 * attributes compared to HTML.
 *
 * This is an important restriction regarding DOM transformation, as some
 * candy during transformation only comes for HTML elements, such as access to
 * `classList` or `style` attributes. Any `class` attribute of a custom
 * namespace requires to be parsed manually (at least, if it has a
 * namespace prefix).
 */
export class HtmlDomConverter {
  static readonly #logger: Logger = LoggerProvider.getLogger("HtmlDomConverter");

  /**
   * Context for conversion.
   */
  readonly api: ConversionApi;
  readonly listener: ConversionListener;
  readonly logger?: Logger;

  /**
   * Constructor.
   *
   * @param targetDocument - target document to transform to
   * @param listener - listener to provide a different behavior
   */
  constructor(targetDocument: Document, listener: ConversionListener = {}) {
    this.api = new ConversionApi(targetDocument);
    this.listener = listener;
  }

  /**
   * Converts the given original node via `convert` and subsequently
   * appends the result to `targetParentNode`. Different to `convert` this
   * ensures that `appended` handler is also called when appending to
   * target parent node.
   *
   * @param originalNode - original node to transform
   * @param targetParentNode - node in target document where to append the
   * conversion result to.
   */
  convertAndAppend(originalNode: Node, targetParentNode: ParentNode): void {
    const { api } = this;

    const context = new ConversionContext(originalNode, api);

    const converted = this.convert(originalNode);

    if (converted) {
      this.#appendChildAndSignal(converted, targetParentNode, context);
    }
  }

  /**
   * Converts the given node and its children to the target
   * document. The processing is performed in this order:
   *
   * 1. **imported:** Node is imported into the current document, possibly
   *    transforming default namespace towards the new document default.
   *    In post-processing, the imported node may be replaced by a new
   *    node.
   * 2. **post-process imported:** An optional post-processing may now
   *    replace the given node.
   * 3. **finish:** In the end, node conversion is finished, providing a
   *    last option for transforming a node and even removing it.
   *
   * @param originalNode - node to convert
   * @returns the imported, not yet attached, node along with converted child
   * nodes; `undefined` if the node is to be ignored in the target document.
   */
  convert(originalNode: Node): Node | undefined {
    const logger = HtmlDomConverter.#logger;
    const { api } = this;
    const context = new ConversionContext(originalNode, api);
    const originalNodeString = logger.isDebugEnabled() ? nodeToString(originalNode) : undefined;

    let result: Node | Skip;

    logger.debug(`convert(${originalNode.nodeName})`, {
      input: originalNodeString,
    });

    // Context is irrelevant in this stage: The source node is the same
    // as the one given here, and the convenience API is bound to the target
    // document and thus irrelevant for modifying the DOM of the original
    // node.
    this.#prepareForImport(originalNode);

    if (logger.isDebugEnabled()) {
      logger.debug(`convert(${originalNode.nodeName}); Stage: prepared`, {
        input: originalNodeString,
        prepared: nodeToString(originalNode),
      });
    }

    result = this.#imported(api.importNode(originalNode), context);

    if (logger.isDebugEnabled()) {
      logger.debug(`convert(${originalNode.nodeName}); Stage: imported`, {
        input: originalNodeString,
        imported: nodeToString(result === skip ? undefined : result),
      });
    }

    if (result !== skip) {
      if (isParentNode(originalNode)) {
        this.#convertChildren(originalNode, result, context);
        result = this.#importedWithChildren(result, context);

        if (logger.isDebugEnabled()) {
          logger.debug(`convert(${originalNode.nodeName}); Stage: importedWithChildren`, {
            input: originalNodeString,
            importedWithChildren: nodeToString(result === skip ? undefined : result),
          });
        }
      }
    }

    if (logger.isDebugEnabled()) {
      logger.debug(`convert(${originalNode.nodeName}); Stage: Done.`, {
        input: originalNodeString,
        output: nodeToString(result === skip ? undefined : result),
      });
    }

    return result === skip ? undefined : result;
  }

  /**
   * Prior to importing the original node, you may want to modify it. Note
   * that allowed modification is limited, though.
   *
   * @param originalNode - original (mutable!) node
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  #prepareForImport(originalNode: Node): void {
    this.listener.prepare?.(originalNode);
  }

  /**
   * Provides the possibility to handle a just imported node. The node is
   * neither attached to DOM, nor children are available.
   *
   * @param importedNode - the just imported node
   * @param context - current conversion context
   * @returns the node to continue with in further processing or a signal
   * what to do instead
   */
  #imported(importedNode: Node, context: ConversionContext): Node | Skip {
    const processed = this.listener.imported?.(importedNode, context);
    return processed ?? importedNode;
  }

  /**
   * Provides the opportunity to handle a just imported node, having its
   * children processed. The node is not attached to the DOM yet, though.
   *
   * @param importedNode - imported node, possibly with children
   * @param context - current conversion context
   * @returns the node to attach to the DOM eventually; or a corresponding
   * signal what to do instead
   */
  #importedWithChildren(importedNode: Node, context: ConversionContext): Node | Skip {
    const processed = this.listener.importedWithChildren?.(importedNode, context);
    return processed ?? importedNode;
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
      return;
    }

    for (const child of originalNode.childNodes) {
      const convertedChild = this.convert(child);
      if (convertedChild) {
        this.#appendChildAndSignal(convertedChild, importedNode, context);
      }
    }
  }

  /**
   * Appends the given child and raises a signal via `appended` as soon as it
   * got appended successfully. Note that special handling for document
   * fragments is applied, as they dissolve when appended. Thus, the signal
   * is raised for each child node contained in the fragment, rather than
   * for the fragment itself.
   *
   * @param convertedChild - child node to add
   * @param parentNode - parent node to append the node to
   * @param context - conversion context information
   */
  #appendChildAndSignal(convertedChild: Node | DocumentFragment, parentNode: Node, context: ConversionContext) {
    if (isDocumentFragment(convertedChild)) {
      // Special handling for notification purpose, as the standard
      // process will pass an empty fragment as `convertedChild`
      // after appending. As `appendChild` will empty the fragment, it
      // is important to remember the children here for notification purpose.
      const fragmentContents = [...convertedChild.childNodes];
      if (this.#appendChild(parentNode, convertedChild)) {
        fragmentContents.forEach((content) => this.#appended(parentNode, content, context));
      }
    } else if (this.#appendChild(parentNode, convertedChild)) {
      this.#appended(parentNode, convertedChild, context);
    }
  }

  /**
   * Called as soon as a node got attached to the DOM.
   *
   * **Note on `context`:** The source node references the related
   * representation of `parentNode` in the original document.
   *
   * @param parentNode - parent node child got appended to
   * @param childNode - child node that got appended
   * @param context - current conversion context
   */
  #appended(parentNode: Node, childNode: Node, context: ConversionContext): void {
    this.listener.appended?.(parentNode, childNode, context);
  }

  /**
   * Called to append a just imported child node to its parent.
   *
   * This method is called when the original node was a parent node having
   * children.
   *
   * Note that processing may have transformed the original parent node to
   * a non-parent node (such as `CharacterData`). While this is rather
   * unexpected, the default implementation handles this case at least when
   * also the imported child is `CharacterData` by appending these data
   * to the parent. Such behavior may signal some misbehavior in processing.
   *
   * @param importedParentNode - the node to append the child to
   * @param importedChildNode - the just imported child node to append
   * @returns `true` if the child node has been handled; `false` if it is not
   * and subclasses may decide to take the responsibility for handling them
   */
  #appendChild(importedParentNode: Node, importedChildNode: Node): boolean {
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
       * We reached this state when the original node was a ParentNode
       * but got transformed to `CharacterData` instead.
       * It is better to perform a transformation of `importedNode` to
       * `CharacterData` when all children have been processed.
       * As an alternative, previous processing could have created a
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
