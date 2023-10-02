import { TaggingRule } from "./TaggingRule";
import { TransformationRule } from "./TransformationRule";

/**
 * A rule to apply during HTML to BBCode processing.
 *
 * The ID has no semantics, but may help during debugging.
 *
 * Regarding the processing order, first all `tag` rules are applied and
 * afterward all `transform` rules. This allows, for example, that other rules
 * toggle the `bold` tag, while there is only one rule, that creates the bold
 * BBCode tag eventually.
 */
export interface HTML2BBCodeRule {
  id: string;
  /**
   * Process the given element and apply tags accordingly.
   *
   * It is good practice, just to set a tag to a truthy value. `false` may
   * always be regarded as the default. Exceptions to this good practice may
   * exist, though.
   *
   * Example: The default rule for `[b]` (bold) just respects font-weight
   * and/or tag name of the `HTMLElement`. It only sets `bold` to `true`,
   * when it has some confidence, that the text should be marked as bold.
   * It will never set the value to `false`, as other rules in undetermined
   * order may consider, for example, class-list entries to toggle the format
   * to bold.
   */
  tag?: TaggingRule;
  /**
   * Transform the tagged element to BBCode. Typical rules apply to only
   * one state, like if an element is considered bold.
   *
   * Rules should assume that there is only one rule that takes care of
   * the actual transformation. If that is not the case, please check your
   * rule-setup.
   *
   * **Example:** Only one rule should map the bold state to `[b]text[/b]`,
   * while others are free to apply additional conditions to set the bold tag
   * within the `tag` processing.
   */
  transform?: TransformationRule;
}
