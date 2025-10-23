import type { ConversionContext } from "./ConversionContext";
import type { Skip } from "./Signals";

/**
 * Listener regarding the import-process, which may intervene some conversion
 * steps and provide a different behavior.
 */
export interface ConversionListener {
  /**
   * Prior to importing the original node, you may want to modify it. Note
   * that allowed modification is limited, though.
   *
   * @param originalNode - original (mutable!) node
   */

  prepare?: (originalNode: Node) => void;

  /**
   * Provides the possibility to handle a just imported node. The node is
   * neither attached to DOM, nor children are available.
   *
   * @param importedNode - the just imported node
   * @param context - current conversion context
   * @returns the node to continue with in further processing or a signal
   * what to do instead; if method is not defined or `undefined` is returned,
   * processing continues with the original node.
   */
  imported?: (importedNode: Node, context: ConversionContext) => Node | Skip | undefined;

  /**
   * Provides the opportunity to handle a just imported node, having its
   * children processed. The node is not attached to the DOM yet, though.
   *
   * @param importedNode - imported node, possibly with children
   * @param context - current conversion context
   * @returns the node to attach to the DOM eventually; or a corresponding
   * signal what to do instead; `undefined` or not implemented would continue
   * processing with the `importedNode`
   */

  importedWithChildren?: (importedNode: Node, context: ConversionContext) => Node | Skip | undefined;

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

  appended?: (parentNode: Node, childNode: Node, context: ConversionContext) => void;
}
