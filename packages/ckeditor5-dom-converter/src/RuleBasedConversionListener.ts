import { skip, Skip } from "./Signals";
import { ConversionContext } from "./ConversionContext";
import { byPriority, RuleSection, SortedRuleSection } from "./Rule";
import { ConversionListener } from "./ConversionListener";
import Logger from "@coremedia/ckeditor5-logging/logging/Logger";

/**
 * Rule based HTML DOM Converter.
 */
export class RuleBasedConversionListener implements ConversionListener {
  /**
   * Rules to process. Expected to be sorted.
   */
  readonly #rules: SortedRuleSection[] = [];

  /**
   * Constructor.
   *
   * @param rules - rules to apply on conversion
   */
  constructor(rules: RuleSection[] = []) {
    this.#rules.push(...rules.sort(byPriority));
  }

  /**
   * Replaces previously configured rules by new ones.
   *
   * @param rules - rules to set
   */
  setRules(rules: RuleSection[]): void {
    this.#rules.length = 0;
    this.#rules.push(...rules.sort(byPriority));
  }

  /**
   * Dumps the IDs of configured rules.
   *
   * @param logger - logger to write debug information to
   * @param indent - optional indent
   */
  dumpRules(logger: Logger, indent = ""): void {
    this.#rules
      .map((section) => section.id)
      .forEach((id) => {
        logger.debug(`${indent}${id}`);
      });
  }

  prepare(originalNode: Node) {
    for (const rule of this.#rules) {
      rule.prepare?.(originalNode);
    }
  }

  imported(importedNode: Node, context: ConversionContext): Node | Skip {
    let result: Node | Skip = importedNode;
    for (const rule of this.#rules) {
      if (result === skip) {
        return skip;
      }
      result = rule.imported?.(result, context) ?? result;
    }
    return result;
  }

  appended(parentNode: Node, childNode: Node, context: ConversionContext) {
    for (const rule of this.#rules) {
      rule.appended?.(parentNode, childNode, context);
    }
  }

  importedWithChildren(importedNode: Node, context: ConversionContext): Node | Skip {
    let result: Node | Skip = importedNode;
    for (const rule of this.#rules) {
      if (result === skip) {
        return skip;
      }
      result = rule.importedWithChildren?.(result, context) ?? result;
    }
    return result;
  }
}
