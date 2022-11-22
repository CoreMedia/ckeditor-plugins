import { DefaultMatchResultType, Matcher } from "../matcher/Matcher";
import { DomConverter } from "../DomConverter";
import { PriorityString } from "@ckeditor/ckeditor5-utils/src/priorities";
import { priorities } from "@ckeditor/ckeditor5-utils";
import { RuleExecutable, RuleExecutionResponse } from "./RuleExecutable";
import { Prioritized } from "./Prioritized";

/**
 * Parameters to pass for rule execution.
 */
export interface RuleExecutionParams<T extends Node = Node> {
  /**
   * Node that matched previously.
   */
  node: T;
  /**
   * Target document to transform to. Only meant as factory for new elements,
   * attributes, etc. Not to be modified during rule execution.
   */
  targetDocument: Document;
  /**
   * Converter, that may be used to pre-process children, for example.
   * Expected corresponding signal to subsequent processing in execution
   * response, like to skip processing children.
   */
  domConverter: DomConverter;
}

/**
 * Represents a rule, which previously matched a given node. This is typically
 * used, if matching and execution is done in different steps.
 */
export class MatchedRule<T extends Node = Node, R = DefaultMatchResultType> implements Prioritized {
  readonly #matchResult: R;
  readonly #executable: RuleExecutable<T, R>;
  readonly #priority: number;

  constructor(matchResult: R, executable: RuleExecutable<T, R>, priority: number) {
    this.#executable = executable;
    this.#priority = priority;
    this.#matchResult = matchResult;
  }

  get priority(): number {
    return this.#priority;
  }

  /**
   * Apply the rule to the given element. If unmatched, `false` will be
   * returned. On match, the element will be processed and the result will
   * be provided in the given response.
   *
   * @param params - parameters required for rule execution
   */
  execute(params: RuleExecutionParams<T>): false | Required<RuleExecutionResponse> {
    return {
      continue: "default",
      ...this.#executable({
        ...params,
        matchResult: this.#matchResult,
      }),
    };
  }
}

/**
 * Represents a rule for nodes.
 */
export class Rule<T extends Node = Node, R = DefaultMatchResultType> implements Prioritized {
  readonly #matcher: Matcher<T, R>;
  readonly #executable: RuleExecutable<T, R>;
  readonly #priority: number;

  constructor(
    matcher: Matcher<T, R>,
    executable: RuleExecutable<T, R>,
    //@ts-expect-error - Typings at DefinitelyTyped don't take `number` into account
    priority: PriorityString = priorities.normal
  ) {
    this.#matcher = matcher;
    this.#executable = executable;
    // Parse Priority String.
    this.#priority = priorities.get(priority);
  }

  /**
   * Get the priority for this rule.
   */
  get priority(): number {
    return this.#priority;
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

  /**
   * Apply the rule to the given node. If unmatched, `false` will be
   * returned. On match, the node will be processed and the result will
   * be provided in the given response.
   *
   * To split up matching and rule execution, use `match` first, followed
   * by eventually executing the matched rule.
   *
   * @param params - parameters required for rule execution
   */
  execute(params: RuleExecutionParams<T>): false | Required<RuleExecutionResponse> {
    const { node } = params;
    const matched = this.match(node);
    if (!matched) {
      return false;
    }
    return matched.execute(params);
  }
}
