import { skip, Skip } from "./Signals";
import { ConversionContext } from "./ConversionContext";
import { SortedRuleSection } from "./Rule";
import { ConversionListener } from "./ConversionListener";

/**
 * Rule based HTML DOM Converter.
 */
export class RuleBasedConversionListener implements ConversionListener {
  /**
   * Rules to process. Expected to be sorted.
   */
  readonly rules: SortedRuleSection[] = [];

  /**
   * Constructor.
   *
   * @param rules - rules to apply on conversion
   */
  constructor(rules: SortedRuleSection[] = []) {
    this.rules = rules;
  }

  prepare(originalNode: Node) {
    for (const rule of this.rules) {
      rule.prepare?.(originalNode);
    }
  }

  imported(importedNode: Node, context: ConversionContext): Node | Skip {
    let result: Node | Skip = importedNode;
    for (const rule of this.rules) {
      if (result === skip) {
        return skip;
      }
      result = rule.imported?.(result, context) ?? result;
    }
    return result;
  }

  appended(parentNode: Node, childNode: Node, context: ConversionContext) {
    for (const rule of this.rules) {
      rule.appended?.(parentNode, childNode, context);
    }
  }

  importedWithChildren(importedNode: Node, context: ConversionContext): Node | Skip {
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
