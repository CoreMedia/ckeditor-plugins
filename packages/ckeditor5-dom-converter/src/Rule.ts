import priorities, { PriorityString } from "@ckeditor/ckeditor5-utils/src/priorities";
import {
  AppendedFunction,
  ImportedFunction,
  ImportedWithChildrenFunction,
  PrepareFunction,
} from "./DomConverterStages";

/**
 * A rule configuration containing related `toData` and `toView` mapping
 * configuration to provide bijective mapping from data such as
 * CoreMedia Rich Text 1.0 to HTML representation in CKEditor's data view
 * and vice versa.
 */
export interface RuleConfig {
  /**
   * Optional ID for rule. Possibly useful for debugging purpose. Propagated
   * as default ID to section configurations.
   */
  id?: string;
  toData?: RuleSectionConfig;
  toView?: RuleSectionConfig;
}

/**
 * A configuration for either `toData` or `toView` transformation.
 */
export interface RuleSectionConfig {
  /**
   * Optional ID for a given configuration. Possibly useful for debugging
   * purpose.
   */
  id?: string;
  /**
   * This methods may operate on the source node prior to importing it into
   * the target document. This may be useful, if the source API is richer
   * than available later in processing. Like, for to data mapping, the data
   * view may contain `HTMLElement` providing access to `HTMLElement.dataset`,
   * while the XML element in target document later is a raw `Element`.
   *
   * Note, that some limitations apply to actions performed in this stage:
   *
   * * You must not relocate or remove the node handed over.
   * * You must not modify any DOM nodes outside the given node.
   *
   * Thus, it is safe for example, to add or remove child nodes or attributes
   * in this stage.
   */
  prepare?: PrepareFunction;
  /**
   * This method operates on a just imported node to target document. It is
   * neither attached to DOM yet and does not contain any child nodes.
   *
   * Note, that information provided via context (such as the original source
   * node) must not be manipulated.
   *
   * Also note, that previous processing may have already adapted or even
   * exchanged the imported node. So, it may make sense to do some checks
   * on the original node instead, like, if a given rule is applicable.
   */
  imported?: ImportedFunction;
  /**
   * This method operates on a just appended child node. As it is called
   * while processing the parent node, the source node reference in context
   * refers to the original representation of the parent node.
   *
   * Note, that while in general `parent` should be of type `ParentNode` and
   * child of type `ChildNode`, previous processing may have provided a
   * different state. Thus, you may require to apply corresponding type
   * checks first.
   */
  appended?: AppendedFunction;
  /**
   * This method operates on an imported node to target document. While it
   * is not attached to DOM yet, children already got converted and
   * appended.
   *
   * Note, that information provided via context (such as the original source
   * node) must not be manipulated.
   *
   * Also note, that previous processing may have already adapted or even
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
 * Utility type to transform a type of given properties to another.
 */
type TransformPropertyType<Type extends object, Key extends keyof Type, ValueType> = Pick<
  Type,
  keyof Omit<Type, Key>
> & {
  [P in Key]: ValueType;
};

/**
 * Parsed Rule Section.
 */
export type RuleSection = TransformPropertyType<RuleSectionConfig, "priority", number> &
  Required<Pick<RuleSectionConfig, "id">>;

/**
 * Represents a rule section, that does not know about its priority anymore.
 * Typically used as input type, to express, that incoming lists of rule
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
  const { id, toData, toView } = config;
  const idWithFallback = id ?? `rule-${randomId()}`;
  return {
    id: idWithFallback,
    toData: toData
      ? parseRuleSectionConfig({
          id: `toData-${idWithFallback}`,
          ...toData,
        })
      : undefined,
    toView: toView
      ? parseRuleSectionConfig({
          id: `toView-${idWithFallback}`,
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
 * (thus descending number). Note, that the sort order adapts the number
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
