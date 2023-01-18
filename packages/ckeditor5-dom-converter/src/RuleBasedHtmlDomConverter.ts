import { HtmlDomConverter } from "./HtmlDomConverter";
import { skip, Skip } from "./Signals";
import { ConversionContext } from "./ConversionContext";
import { SortedRuleSection } from "./Rule";

/**
 * Rule based HTML DOM Converter.
 */
export class RuleBasedHtmlDomConverter extends HtmlDomConverter {
  /**
   * Rules to process. Expected to be sorted.
   */
  readonly rules: SortedRuleSection[] = [];

  /**
   * Constructor.
   *
   * @param targetDocument - target document to transform to
   * @param rules - rules to apply on conversion
   */
  constructor(targetDocument: Document, rules: SortedRuleSection[] = []) {
    super(targetDocument);
    this.rules = rules;
  }

  protected prepareForImport(originalNode: Node) {
    for (const rule of this.rules) {
      rule.prepare?.(originalNode);
    }
  }

  protected imported(importedNode: Node, context: ConversionContext): Node | Skip {
    let result: Node | Skip = importedNode;
    for (const rule of this.rules) {
      if (result === skip) {
        return skip;
      }
      result = rule.imported?.(result, context) ?? result;
    }
    return result;
  }

  protected appended(parentNode: Node, childNode: Node, context: ConversionContext) {
    for (const rule of this.rules) {
      rule.appended?.(parentNode, childNode, context);
    }
  }

  protected importedWithChildren(importedNode: Node, context: ConversionContext): Node | Skip {
    let result: Node | Skip = importedNode;
    for (const rule of this.rules) {
      if (result === skip) {
        return skip;
      }
      result = rule.importedWithChildren?.(result, context) ?? result;
    }
    return result;
  }
}
