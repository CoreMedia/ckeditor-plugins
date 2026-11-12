import type { PriorityString } from "ckeditor5";
import { priorities } from "ckeditor5";
import type { RequireSelected } from "@coremedia/ckeditor5-common";
import type {
  AppendedFunction,
  ImportedFunction,
  ImportedWithChildrenFunction,
  PrepareFunction,
} from "./DomConverterStages";

export interface RuleConfigBase {
  /**
   * Optional ID for rule. Possibly useful for debugging purpose. Propagated
   * as part of the default ID to section configurations.
   */
  id?: string;
  toData?: RuleSectionConfig;
  toView?: RuleSectionConfig;
  /**
   * The default priority to be propagated to rule sections. May be overridden
   * in sections.
   */
  priority?: PriorityString;
}

/**
 * A rule configuration containing related `toData` and `toView` mapping
 * configuration to provide bijective mapping from data such as
 * CoreMedia Rich Text 1.0 to HTML representation in CKEditor's data view
 * and vice versa.
 */
export type RuleConfig = RequireSelected<RuleConfigBase, "toData"> | RequireSelected<RuleConfigBase, "toView">;

/**
 * A configuration for either `toData` or `toView` transformation.
 *
 * While processing, the following steps will be sequentially invoked
 * for a given node:
 *
 * 1. prepare
 * 2. imported
 * 3. importedWithChildren
 * 4. appended
 *
 * Note that for a given node, first all `prepare` steps are executed for
 * a given node, then all `imported` steps, and so on. Thus, do not
 * expect by default that a node handled in `prepare` step comes unchanged
 * to the next step _imported_.
 */
export interface RuleSectionConfigBase {
  /**
   * Optional ID for a given configuration. Possibly useful for debugging
   * purpose.
   */
  id?: string;
  /**
   * This method may operate on the source node prior to importing it into
   * the target document. This may be useful if the source API is richer
   * than available later in processing. Like, for to data mapping, the data
   * view may contain `HTMLElement` providing access to `HTMLElement.dataset`,
   * while the XML element in the target document later is a raw `Element`.
   *
   * Note that some limitations apply to actions performed in this stage:
   *
   * * You must not relocate or remove the node handed over.
   * * You must not modify any DOM nodes outside the given node.
   *
   * Thus, it is safe, for example, to add or remove child nodes or attributes
   * in this stage.
   */
  prepare?: PrepareFunction;
  /**
   * This method operates on a just imported node to the target document. It is
   * neither attached to DOM and does not contain any child nodes.
   *
   * Note, that information provided via context (such as the original source
   * node) must not be manipulated.
   *
   * Also note that previous processing may have already adapted or even
   * exchanged the imported node. So, it may make sense to do some checks
   * on the original node instead, like, if a given rule is applicable.
   *
   * Typical behaviors done at this stage:
   *
   * * Adapt attributes.
   * * Exchange node by another (just by returning a new one).
   *
   * You may also append child nodes in this state. Original child nodes will
   * then be appended. Nevertheless, structural changes are best applied
   * in the `importedWithChildren` step, as you have full control of the
   * structure then.
   *
   * Alternative to this, you may add children to the original
   * DOM as part of the `prepare` step.
   */
  imported?: ImportedFunction;
  /**
   * This method operates on a just appended child node. As it is called
   * while processing the parent node, the source node reference in context
   * refers to the original representation of the parent node.
   *
   * Note that while in general `parent` should be of type `ParentNode` and
   * child of type `ChildNode`, previous processing may have provided a
   * different state. Thus, you may require applying corresponding type
   * checks first.
   */
  appended?: AppendedFunction;
  /**
   * This method operates on an imported node to the target document. While it
   * is not attached to DOM yet, children already got converted and
   * appended.
   *
   * Note, that information provided via context (such as the original source
   * node) must not be manipulated.
   *
   * Also note that previous processing may have already adapted or even
   * exchanged the imported node. So, it may make sense to do some checks
   * on the original node instead, like, if a given rule is applicable.
   */
  importedWithChildren?: ImportedWithChildrenFunction;
  /**
   * Priority in which the given rule section is executed.
   * Defaults to priority `normal`.
   */
  priority?: PriorityString;
}

/**
 * A configuration for either `toData` or `toView` transformation.
 */
export type RuleSectionConfig =
  | RequireSelected<RuleSectionConfigBase, "prepare">
  | RequireSelected<RuleSectionConfigBase, "imported">
  | RequireSelected<RuleSectionConfigBase, "appended">
  | RequireSelected<RuleSectionConfigBase, "importedWithChildren">;

/**
 * Utility type to transform a type of given properties to another.
 */
export type TransformPropertyType<Type extends object, Key extends keyof Type, ValueType> = Pick<
  Type,
  keyof Omit<Type, Key>
> &
  Record<Key, ValueType>;

/**
 * Parsed Rule Section.
 */
export type RuleSection = TransformPropertyType<RuleSectionConfig, "priority", number> &
  Required<Pick<RuleSectionConfig, "id">>;

/**
 * Represents a rule section, that does not know about its priority anymore.
 * Typically used as an input type, to express that incoming lists of rule
 * sections are already sorted.
 */
export type SortedRuleSection = Omit<RuleSection, "priority">;

/**
 * Parsed rule.
 */
export type Rule = TransformPropertyType<RuleConfig, "toData" | "toView", RuleSection | undefined> &
  Required<Pick<RuleConfig, "id">>;

/**
 * Parses the given rule section configuration into a rule section.
 *
 * @param config - configuration to parse
 */
export const parseRuleSectionConfig = (config: RuleSectionConfig): RuleSection => {
  const { id } = config;
  const idWithFallback = id ?? `rule-section-${randomId()}`;
  return {
    ...config,
    id: idWithFallback,
    priority: priorities.get(config.priority ?? "normal"),
  };
};

/**
 * Parses a set of rule section configurations and orders them by priority.
 *
 * @param configs - configurations to parse
 */
export const parseAndSortRuleSectionConfigs = (configs: RuleSectionConfig[]): RuleSection[] =>
  configs.map(parseRuleSectionConfig).sort(byPriority);

/**
 * Some random ID to provide as default.
 */
const randomId = () => Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);

/**
 * Parses the given rule configuration into a rule.
 *
 * @param config - configuration to parse
 */
export const parseRule = (config: RuleConfig): Rule => {
  const { id, toData, toView, priority } = config;
  const idWithFallback = id ?? `rule-${randomId()}`;
  return {
    id: idWithFallback,
    toData: toData
      ? parseRuleSectionConfig({
          id: `toData-${idWithFallback}`,
          priority,
          ...toData,
        })
      : undefined,
    toView: toView
      ? parseRuleSectionConfig({
          id: `toView-${idWithFallback}`,
          priority,
          ...toView,
        })
      : undefined,
  };
};

/**
 * Merges given rule sections into one respecting their priority.
 *
 * @param sections1 - first set of sections
 * @param sections2 - second set of sections
 */
export const mergeRuleSections = (sections1: RuleSection[], sections2: RuleSection[]): RuleSection[] =>
  [...sections1, ...sections2].sort(byPriority);

/**
 * Method to compare two prioritized objects to sort them by ascending priority
 * (thus descending number). Note that the sort order adapts the number
 * representation for high and low priorities as defined by
 * CKEditor's `PriorityString`.
 *
 * @example
 * ```typescript
 * const objs: Prioritized[] = [
 *   {priority: -2},
 *   {priority: 2},
 *   {priority: -1},
 *   {priority: 1},
 *   {priority: 0},
 * ];
 *
 * objs.sort(byPriority);
 * // [2, 1, 0, -1, -2]
 * ```
 *
 * @param a - first prioritized object
 * @param b - second prioritized object
 */
export const byPriority = (a: RuleSection, b: RuleSection) => b.priority - a.priority;
