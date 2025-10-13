import type { ConversionContext } from "./ConversionContext";
import type { Skip } from "./Signals";

/**
 * Prior to importing the original node, you may want to modify it. Note
 * that allowed modification is limited, though. Expected use-cases are:
 *
 * * Modify attributes prior to import.
 * * Modify children prior to import.
 *
 * This function is especially useful for data view to data transformation,
 * where the data view provides richer HTML API, such as `HTMLElement`
 * providing access to `dataset`.
 *
 * This function must not detach the original node from DOM or relocate it.
 *
 * @param node - original (mutable!) node
 */
export type PrepareFunction = (node: Node) => void;

/**
 * Provides the possibility to handle a just imported node. The node is
 * neither attached to DOM, nor children are available.
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
 *   some node that may not hold any children at this stage, as children
 *   will not be handled at all. Better do so in later processing.
 *
 * * You may _expand_ a given node to a set of nodes by returning
 *   a `DocumentFragment` instead. Note, though, that in this stage
 *   subsequent child nodes will be appended to this `DocumentFragment`
 *   which may be unexpected. In general, such _expansion_ should be done
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
 *   when the children have been processed. Otherwise, ensure
 *   you understand possible implications of doing this in this early stage,
 *   such as that children not being converted to CharacterData are
 *   ignored, and that CharacterData are just appended without taking
 *   the actual type of data into account.
 *
 * * When transforming from HTML to XML, you may experience a rather
 *   limited API for `importedNode` compared to the original node.
 *   Like in XML, there is no `HTMLElement.dataset`. Dealing with this
 *   richer API is best done in the setup phase by overriding
 *   `prepareForImport`. Here you may modify the DOM with some restrictions
 *   to ease further processing.
 *
 * @param importedNode - the just imported node
 * @param context - current conversion context
 * @returns the node to continue with in further processing or a signal
 * what to do instead
 */
export type ImportedFunction = (node: Node, context: ConversionContext) => Node | Skip | undefined;

/**
 * Provides the opportunity to handle a just imported node, having its
 * children processed. The node is not attached to the DOM yet, though.
 *
 * **Implementation Notes:**
 *
 * * To replace a node with its children, you may return a `DocumentFragment`
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
export type ImportedWithChildrenFunction = ImportedFunction;

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
export type AppendedFunction = (parent: Node, child: Node, context: ConversionContext) => void;
