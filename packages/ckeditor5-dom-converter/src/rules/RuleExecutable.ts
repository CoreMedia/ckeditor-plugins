import { SubsequentAction } from "./SubsequentAction";
import { DefaultMatchResultType } from "../matcher/Matcher";
import { RuleExecutionParams } from "./Rule";

/**
 * Response of a matched and processed element.
 */
export interface RuleExecutionResponse {
  /**
   * Node, that contains transformed element. Use empty document fragment
   * in return to remove an element, thus, to not transform it to target
   * document.
   */
  node: Node;
  /**
   * Signals, how to continue processing.
   *
   * * `default` (the default) will continue with children, then with
   *   siblings.
   * * `skipChildren` will skip processing children, which either means to
   *   ignore them, or that the rule executable already processed the
   *   children.
   */
  continue?: SubsequentAction;
}

/**
 * Contextual information while executing a rule's executable after successful
 * match.
 */
export interface RuleExecutableExecutionParams<T extends Node = Node, R = DefaultMatchResultType>
  extends RuleExecutionParams<T> {
  /**
   * Result from previous successful match. May contain relevant data
   * for element transformation.
   */
  matchResult: R;
}

/**
 * Execution of rule.
 */
export type RuleExecutable<T extends Node = Node, R = DefaultMatchResultType> = (
  params: RuleExecutableExecutionParams<T, R>
) => RuleExecutionResponse;
