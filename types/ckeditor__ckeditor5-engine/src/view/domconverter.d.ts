import ViewDocument from "./document";
import { MatcherPattern } from "./matcher";
import ViewNode from "./node";
import ViewDocumentFragment from "./documentfragment";
import { BlockFillerMode } from "./filler";

/**
 * `DomConverter` is a set of tools to do transformations between DOM nodes and
 * view nodes. It also handles bindings between these nodes.
 *
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_view_domconverter-DomConverter.html">Class DomConverter (engine/view/domconverter~DomConverter) - CKEditor 5 API docs</a>
 */
export default class DomConverter {
  constructor(document: ViewDocument, options?: {
    blockFillerMode?: BlockFillerMode
  });

  /**
   * Registers a MatcherPattern for view elements whose content should be treated as a raw data
   * and not processed during conversion from DOM nodes to view elements.
   *
   * @param {MatcherPattern} pattern Pattern matching view element which content should
   * be treated as a raw data.
   */
  registerRawContentMatcher(pattern: MatcherPattern): void;

  /**
   * Converts view to DOM. For all text nodes, not bound elements and document fragments new items will
   * be created. For bound elements and document fragments function will return corresponding items.
   *
   * @param {ViewNode|ViewDocumentFragment} viewNode
   * View node or document fragment to transform.
   * @param {Document} domDocument Document which will be used to create DOM nodes.
   * @param {Object} [options] Conversion options.
   * @param {Boolean} [options.bind=false] Determines whether new elements will be bound.
   * @param {Boolean} [options.withChildren=true] If `true`, node's and document fragment's children will be converted too.
   * @returns {Node|DocumentFragment} Converted node or DocumentFragment.
   */
  viewToDom(viewNode: ViewNode | ViewDocumentFragment, domDocument: Document, options?: {
    bind?: boolean,
    withChildren?: boolean,
  }): Node | DocumentFragment;
}
