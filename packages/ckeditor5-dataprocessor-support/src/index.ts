/**
 * @module ckeditor5-dataprocessor-support
 */
export type { AttributeMapper } from "./Attributes";
export {
  renameAttribute,
  preserveAttributeAs,
  allAttributeMappers,
  asDataFilterRule,
  asViewFilterRule,
} from "./Attributes";

export type { AttributeValue, AttributeMap, ElementFilterParams, ElementFilterRule } from "./ElementProxy";
export { ElementProxy, allFilterRules } from "./ElementProxy";

export type { ElementFilterRulesByName, ElementFilterRuleSet, FilterRuleSet, TextFilterRuleSet } from "./HtmlFilter";
export { AFTER_ELEMENT, AFTER_ELEMENT_AND_CHILDREN, BEFORE_ELEMENT, FilterMode, HtmlFilter } from "./HtmlFilter";

export type { Namespaces, Namespace } from "./Namespace";
export { DEFAULT_NAMESPACE_PREFIX, DEFAULT_NAMESPACES } from "./Namespace";

export type { ChildPredicate, PersistResponse } from "./NodeProxy";
export { NodeProxy, NodeState, RESPONSE_ABORT, RESPONSE_CONTINUE } from "./NodeProxy";

export type {
  ElementsFilterRuleSetConfiguration,
  ElementsFilterRuleSetConfigurationValueType,
  FilterRuleSetConfiguration,
  ParsedToDataAndView,
  PreParsedElementSection,
  PreParsedToDataAndView,
  PreParsedToView,
  TextFilterRuleSetConfigurationValueType,
  ToDataAndViewElementConfiguration,
  ToDataAndViewTextConfiguration,
} from "./Rules";
export { mergePreParsedToViews, parseFilterRuleSetConfigurations } from "./Rules";

export { rulesLogger } from "./RulesLogger";

export type { TextFilterParams, TextFilterRule } from "./TextProxy";
export { TextProxy } from "./TextProxy";

export { warnOnAmbiguousElementState } from "./RulesLogger";
