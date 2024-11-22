/* eslint no-null/no-null: off */

import { ElementFilterRule, ElementProxy } from "./ElementProxy";
import { TextProxy, TextFilterRule } from "./TextProxy";
import { Logger, LoggerProvider } from "@coremedia/ckeditor5-logging";
import { Editor } from "ckeditor5";

enum FilterMode {
  toData,
  toView,
}

type ElementFilterRulesByName = Record<string, ElementFilterRule>;

interface ElementFilterRuleSet {
  elements?: ElementFilterRulesByName;
}

interface TextFilterRuleSet {
  text?: TextFilterRule;
}

type FilterRuleSet = ElementFilterRuleSet & TextFilterRuleSet;

/**
 * Special purpose element token for a rule applied before the element
 * itself.
 */
const BEFORE_ELEMENT = "^";
/**
 * Special purpose element token for a rule applied directly after the
 * element has been processed.
 */
const AFTER_ELEMENT = "$";
/**
 * Special purpose element token for a rule applied after the element and
 * all its children have been processed.
 */
const AFTER_ELEMENT_AND_CHILDREN = "$$";

/**
 * This filter implements a similar behavior as the HTML filter introduced
 * with CKEditor 4.
 *
 * **Findings on CKEditor 4 Filtering**
 *
 * **Element, then Children:** Filtering is done in that way, that
 * first the element itself is processed. Afterwards, its children. This means,
 * that for example an element cannot determine if it is empty, when subsequent
 * filtering may remove child elements.
 *
 * **`$`-Rule after Children:** Only the $ rule is applied last to
 * an element, i.e., it is ensured, that all children were processed. This is
 * the only valid location to judge on empty/non-empty.
 *
 * In contrast to CKEditor 4, this filter introduces two levels of
 * post-processing: `$` rule is applied right after any element, while
 * `$$` denotes a rule processed after the element and all its children
 * have been processed.
 *
 * @see {@link https://ckeditor.com/docs/ckeditor4/latest/api/CKEDITOR_htmlParser_filter.html | Class Filter (CKEDITOR.htmlParser.filter)}
 * @see {@link https://ckeditor.com/docs/ckeditor4/latest/api/CKEDITOR_htmlParser_node.html | Class Node (CKEDITOR.htmlParser.node) — CKEditor 4 API docs}
 */
class HtmlFilter {
  static readonly #logger: Logger = LoggerProvider.getLogger("HtmlFilter");
  readonly #ruleSet: FilterRuleSet;
  readonly #editor: Editor;

  constructor(ruleSet: FilterRuleSet, editor: Editor) {
    this.#ruleSet = ruleSet;
    this.#editor = editor;
  }

  public applyTo(root: Node): void {
    const logger = HtmlFilter.#logger;
    logger.debug(`Applying filter to root node ${root.nodeName}.`, {
      root,
    });
    // In CKEditor 4 we had an extra filter for the root node. If we want to introduce
    // this again, we should do it here.
    this.#applyToChildNodes(root);
  }

  #applyToChildNodes(parent: Node): void {
    const logger = HtmlFilter.#logger;
    logger.debug(`Applying filter to child nodes of ${parent.nodeName}.`, {
      parent,
    });
    let next: Node | null = parent.firstChild;
    while (next) {
      next = this.#applyToCurrent(parent, next);
    }
  }

  /**
   * Applies rules to the current node and all of its child nodes.
   *
   * @param parent - parent of node
   * @param currentNode - current node to process
   * @returns next sibling node to process
   */
  #applyToCurrent(parent: Node, currentNode: Node): Node | null {
    const logger = HtmlFilter.#logger;
    logger.debug(`Applying filter to ${currentNode.nodeName}.`, {
      parent,
      currentNode,
    });
    const next = currentNode.nextSibling;
    let newCurrentSupplier: () => Node | null = () => null;
    if (currentNode instanceof Element) {
      const proxy = new ElementProxy(currentNode, this.#editor);
      /*
       * We need to handle the children prior to the last rule. This provides the
       * opportunity, that the last rule may decide on a now possibly empty node.
       *
       * We may re-use `currentNode` here, as the rule will not be executed, if any
       * rule before replaces `currentNode` by a new node.
       */
      const handleChildrenRule: ElementFilterRule = (p) => {
        this.#applyToChildNodes(p.node.delegate);
      };
      if (this.#ruleSet.elements) {
        const beforeRule: ElementFilterRule | undefined = this.#ruleSet.elements[BEFORE_ELEMENT];
        const filterRule: ElementFilterRule | undefined = this.#ruleSet.elements[currentNode.nodeName.toLowerCase()];
        const afterRule: ElementFilterRule | undefined = this.#ruleSet.elements[AFTER_ELEMENT];
        const afterChildrenRule: ElementFilterRule | undefined = this.#ruleSet.elements[AFTER_ELEMENT_AND_CHILDREN];
        newCurrentSupplier = () =>
          proxy.applyRules(beforeRule, filterRule, afterRule, handleChildrenRule, afterChildrenRule);
      } else {
        // No element rules? We need to at least handle the children.
        newCurrentSupplier = () => proxy.applyRules(handleChildrenRule);
      }
    } else if (currentNode instanceof Text) {
      if (this.#ruleSet.text) {
        const proxy = new TextProxy(currentNode, this.#editor);
        newCurrentSupplier = () => proxy.applyRules(this.#ruleSet.text);
      }
    }
    const newCurrent = newCurrentSupplier();
    if (logger.isDebugEnabled()) {
      if (newCurrent) {
        logger.debug(`Will restart with new node ${newCurrent.nodeName}.`, {
          parent,
          replacedNode: currentNode,
          next: newCurrent,
        });
      } else {
        logger.debug(`Will continue with next sibling of ${currentNode.nodeName}.`, {
          parent,
          currentNode,
          next: currentNode.nextSibling,
        });
      }
    }
    return newCurrent ?? next;
  }
}

export {
  AFTER_ELEMENT,
  AFTER_ELEMENT_AND_CHILDREN,
  BEFORE_ELEMENT,
  ElementFilterRulesByName,
  ElementFilterRuleSet,
  FilterMode,
  FilterRuleSet,
  HtmlFilter,
  TextFilterRuleSet,
};
