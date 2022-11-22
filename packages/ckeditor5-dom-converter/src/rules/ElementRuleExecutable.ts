import { ElementPredicate } from "../matcher/Element";
import { RuleExecutable, RuleExecutionResponse } from "./RuleExecutable";

/**
 * Type of element rule executable responses.
 */
export type ElementRuleExecutableResponse = Exclude<ReturnType<ElementPredicate>, false>;

/**
 * Executable for element rules.
 */
export type ElementRuleExecutable = RuleExecutable<Element, ElementRuleExecutableResponse>;
