import MutableElement, { ElementFilterRule } from "./MutableElement";

export type TextFilterFunctionResult = Text | string | boolean | void;
export type TextFilterFunction = (text: string | null, textNode: Text) => TextFilterFunctionResult;

export interface FilterRuleSet {
  elements?: { [key: string]: ElementFilterRule };
  text?: TextFilterFunction;
}

export const BEFORE_ELEMENT = "^";
export const AFTER_ELEMENT = "$";

/**
 * This filter implements a similar behavior as the HTML filter introduced
 * with CKEditor 4.
 *
 * @see <a href="https://ckeditor.com/docs/ckeditor4/latest/api/CKEDITOR_htmlParser_filter.html">Class Filter (CKEDITOR.htmlParser.filter) - CKEditor 4 API docs</a>
 * @see <a href="https://ckeditor.com/docs/ckeditor4/latest/api/CKEDITOR_htmlParser_node.html">Class Node (CKEDITOR.htmlParser.node) - CKEditor 4 API docs</a>
 */
export default class HtmlFilter {
  private readonly ruleSet: FilterRuleSet;

  constructor(ruleSet: FilterRuleSet) {
    this.ruleSet = ruleSet;
  }

  public applyTo(root: Node): void {
    // TODO[cke] Provide a root-filter just as CKEditor 4?
    //   If yes, this must not replace the root node, or we need to pass
    //   the new root back.
    this.applyToChildNodes(root);
  }

  private applyToChildNodes(parent: Node, startFrom?: Node): void {
    const childNodes: ChildNode[] = Array.from(parent.childNodes);
    /*
     * doFilter:
     *   This controls the "restart from" feature. If we want to restart from
     *   a given node, we don't want to start filtering the child nodes, until
     *   we have reached the desired node. Thus, if `startFrom` is set, we
     *   will start to loop without filtering until we have found the desired
     *   node.
     */
    let doFilter = !startFrom;
    for (const childNode of childNodes) {
      doFilter = doFilter || childNode.isSameNode(startFrom || null);
      if (doFilter) {
        /*
         * If `abort` is signalled, we assume, that the processing got restarted
         * in another way. This typically happens, when an element got replaced:
         * `applyToCurrent` restarted processing with the new element, thus
         * we skip processing with the now outdated element and thus, outdated
         * node structure.
         */
        if (!this.applyToCurrent(parent, childNode)) {
          break;
        }
      }
    }
  }

  /**
   * Applies rules to the current node and all of its child nodes.
   *
   * @param parent parent of node
   * @param currentNode current node to process
   * @private
   * @return `true` if filtering shall continue; `false` if not
   */
  private applyToCurrent(parent: Node, currentNode: Node): boolean {
    if (currentNode instanceof Element && this.ruleSet.elements) {
      const beforeRule: ElementFilterRule | undefined = this.ruleSet.elements[BEFORE_ELEMENT];
      const filterRule: ElementFilterRule | undefined = this.ruleSet.elements[currentNode.nodeName.toLowerCase()];
      // We need to handle the children prior to the last rule. This provides the
      // opportunity, that the last rule may decide on a now possibly empty node.
      const handleChildrenRule: ElementFilterRule = () => {
        this.applyToChildNodes(currentNode);
      };
      const afterRule: ElementFilterRule | undefined = this.ruleSet.elements[AFTER_ELEMENT];

      const mutableElement = new MutableElement(currentNode);

      const newCurrent = mutableElement.applyRules(beforeRule, filterRule, handleChildrenRule, afterRule);

      if (newCurrent) {
        this.applyToChildNodes(parent, newCurrent);
        return false;
      }
    }
    return true;
  }
}
