import { DefaultMatchResultType } from "../matcher/Matcher";
import { RuleExecutionParams } from "./Rule";

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
) => Node;
