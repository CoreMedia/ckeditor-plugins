import { DefaultMatchResultType, Matcher } from "../matcher/Matcher";
import { PriorityString } from "@ckeditor/ckeditor5-utils/src/priorities";
import { priorities } from "@ckeditor/ckeditor5-utils";
import { RuleExecutable } from "./RuleExecutable";
import { byPriority, Prioritized } from "./Prioritized";

/**
 * Parameters to pass for rule execution.
 */
export interface RuleExecutionParams<T extends Node = Node> {
  /**
   * Node that matched previously.
   */
  node: T;
}

/**
 * Represents a rule, which previously matched a given node. This is typically
 * used, if matching and execution is done in different steps.
 */
export class MatchedRule<T extends Node = Node, R = DefaultMatchResultType> implements Prioritized {
  /**
   * The result of the previous match. This result may be important, as rules
   * with higher priorities may have already modified the matched node.
   * Having the match result, you may be able to determine its original state
   * if required.
   */
  readonly #matchResult: R;
  readonly #executable: RuleExecutable<T, R>;
  readonly priority: number;

  constructor(matchResult: R, executable: RuleExecutable<T, R>, priority: number) {
    this.#executable = executable;
    this.priority = priority;
    this.#matchResult = matchResult;
  }

  /**
   * Apply the rule to the given element.
   *
   * @param node - the node to process
   */
  execute(node: T): Node {
    return this.#executable({
      node,
      matchResult: this.#matchResult,
    });
  }
}

/**
 * Represents a rule for nodes.
 */
export class Rule<T extends Node = Node, R = DefaultMatchResultType> implements Prioritized {
  readonly #matcher: Matcher<T, R>;
  readonly #executable: RuleExecutable<T, R>;
  readonly priority: number;

  constructor(
    matcher: Matcher<T, R>,
    executable: RuleExecutable<T, R>,
    //@ts-expect-error - Typings at DefinitelyTyped don't take `number` into account
    priority: PriorityString = priorities.normal
  ) {
    this.#matcher = matcher;
    this.#executable = executable;
    // Parse Priority String.
    this.priority = priorities.get(priority);
  }

  /**
   * Matches the given node. If it matches, a matched rule will be returned,
   * which may then be called to process the given node. Returns `false`
   * on no match.
   *
   * @param node - node to match
   */
  match(node: T): false | MatchedRule<T, R> {
    const matchResult = this.#matcher.match(node);
    if (!matchResult) {
      return false;
    }
    return new MatchedRule<T, R>(matchResult, this.#executable, this.priority);
  }
}

/**
 * Filters applicable rules for the given node.
 *
 * @param node - node to match
 * @param rules - rules to filter
 * @param sorted - if to sort applicable rules by priority
 */
export const applicableRules = (node: Node, rules: Rule[], sorted = true): MatchedRule[] => {
  const matchResults = rules.map((r) => r.match(node));
  const result: MatchedRule[] = [];
  for (const matchResult of matchResults) {
    if (matchResult) {
      result.push(matchResult);
    }
  }
  if (sorted) {
    result.sort(byPriority);
  }
  return result;
};
