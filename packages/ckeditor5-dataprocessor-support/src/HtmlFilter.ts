import ElementProxy, { ElementFilterRule } from "./ElementProxy";
import TextProxy, { TextFilterRule } from "./TextProxy";
import { LoggerProvider, Logger } from "@coremedia/coremedia-utils/index";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";

export interface ElementFilterRulesByName {
  [key: string]: ElementFilterRule;
}

export interface ElementFilterRuleSet {
  elements?: ElementFilterRulesByName;
}

export interface TextFilterRuleSet {
  text?: TextFilterRule,
}

export type FilterRuleSet = ElementFilterRuleSet & TextFilterRuleSet;

/**
 * Special purpose element token for a rule applied before the element
 * itself.
 */
export const BEFORE_ELEMENT = "^";
/**
 * Special purpose element token for a rule applied directly after the
 * element has been processed.
 */
export const AFTER_ELEMENT = "$";
/**
 * Special purpose element token for a rule applied after the element and
 * all its children have been processed.
 */
export const AFTER_ELEMENT_AND_CHILDREN = "$$";

/**
 * <p>
 * This filter implements a similar behavior as the HTML filter introduced
 * with CKEditor 4.
 * </p>
 * <p><strong>Findings on CKEditor 4 Filtering</strong></p>
 * <p>
 * <strong>Element, then Children:</strong> Filtering is done in that way, that
 * first the element itself is processed. Afterwards, its children. This means,
 * that for example an element cannot determine if it is empty, when subsequent
 * filtering may remove child elements.
 * </p>
 * <p>
 * <strong>$-Rule after Children:</strong> Only the $ rule is applied last to
 * an element, i.e. it is ensured, that all children were processed. This is
 * the only valid location to judge on empty/non-empty.
 * </p>
 * <p>
 * In contrast to CKEditor 4, this filter introduces two levels of
 * post-processing: `$` rule is applied right after any element, while
 * `$$` denotes a rule processed after the element and all its children
 * have been processed.
 * </p>
 *
 * @see <a href="https://ckeditor.com/docs/ckeditor4/latest/api/CKEDITOR_htmlParser_filter.html">Class Filter (CKEDITOR.htmlParser.filter) - CKEditor 4 API docs</a>
 * @see <a href="https://ckeditor.com/docs/ckeditor4/latest/api/CKEDITOR_htmlParser_node.html">Class Node (CKEDITOR.htmlParser.node) - CKEditor 4 API docs</a>
 */
export default class HtmlFilter {
  static readonly #logger: Logger = LoggerProvider.getLogger("HtmlFilter");

  private readonly _ruleSet: FilterRuleSet;
  private readonly _editor: Editor;

  constructor(ruleSet: FilterRuleSet, editor: Editor) {
    this._ruleSet = ruleSet;
    this._editor = editor;
  }

  public applyTo(root: Node): void {
    const logger = HtmlFilter.#logger;

    logger.debug(`Applying filter to root node ${root.nodeName}.`, { root: root });
    // In CKEditor 4 we had an extra filter for the root node. If we want to introduce
    // this again, we should do it here.
    this.applyToChildNodes(root);
  }

  private applyToChildNodes(parent: Node): void {
    const logger = HtmlFilter.#logger;

    logger.debug(`Applying filter to child nodes of ${parent.nodeName}.`, { parent: parent });
    let next: Node | null = parent.firstChild;
    while (next) {
      next = this.applyToCurrent(parent, next);
    }
  }

  /**
   * Applies rules to the current node and all of its child nodes.
   *
   * @param parent parent of node
   * @param currentNode current node to process
   * @return next sibling node to process
   * @private
   */
  private applyToCurrent(parent: Node, currentNode: Node): Node | null {
    const logger = HtmlFilter.#logger;

    logger.debug(`Applying filter to ${currentNode.nodeName}.`, { parent: parent, currentNode: currentNode });

    let next = currentNode.nextSibling;
    let newCurrentSupplier: () => Node | null = () => null;

    if (currentNode instanceof Element) {
      const proxy = new ElementProxy(currentNode, this._editor);
      /*
       * We need to handle the children prior to the last rule. This provides the
       * opportunity, that the last rule may decide on a now possibly empty node.
       *
       * We may re-use `currentNode` here, as the rule will not be executed, if any
       * rule before replaces `currentNode` by a new node.
      */
      const handleChildrenRule: ElementFilterRule = (p) => {
        this.applyToChildNodes(p.node.delegate);
      };

      if (this._ruleSet.elements) {
        const beforeRule: ElementFilterRule | undefined = this._ruleSet.elements[BEFORE_ELEMENT];
        const filterRule: ElementFilterRule | undefined = this._ruleSet.elements[currentNode.nodeName.toLowerCase()];
        const afterRule: ElementFilterRule | undefined = this._ruleSet.elements[AFTER_ELEMENT];
        const afterChildrenRule: ElementFilterRule | undefined = this._ruleSet.elements[AFTER_ELEMENT_AND_CHILDREN];

        newCurrentSupplier = () => proxy.applyRules(beforeRule, filterRule, afterRule, handleChildrenRule, afterChildrenRule);
      } else {
        // No element rules? We need to at least handle the children.
        newCurrentSupplier = () => proxy.applyRules(handleChildrenRule);
      }
    } else if (currentNode instanceof Text) {
      if (this._ruleSet.text) {
        const proxy = new TextProxy(currentNode, this._editor);
        newCurrentSupplier = () => proxy.applyRules(this._ruleSet.text);
      }
    }

    const newCurrent = newCurrentSupplier();

    if (logger.isDebugEnabled()) {
      if (newCurrent) {
        logger.debug(`Will restart with new node ${newCurrent.nodeName}.`, {
          parent: parent,
          replacedNode: currentNode,
          next: newCurrent
        });
      } else {
        logger.debug(`Will continue with next sibling of ${currentNode.nodeName}.`, {
          parent: parent,
          currentNode: currentNode,
          next: currentNode.nextSibling
        });
      }
    }

    return newCurrent || next;
  }
}
