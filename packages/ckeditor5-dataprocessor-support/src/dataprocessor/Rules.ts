import { ElementsFilterRuleSet, FilterRuleSet } from "./HtmlFilter";
import { ElementFilterParams, ElementFilterRule } from "./MutableElement";

/**
 * This represents the combination of toData/toView.
 */
export interface ToDataAndView {
  toData: FilterRuleSet,
  toView: FilterRuleSet,
}

/**
 * Interface for separate toData/toView Handling within the configuration.
 */
export interface ToDataAndViewConfiguration {
  toData?: ElementFilterRule,
  toView?: ElementFilterRule | ElementsFilterRuleSet,
}

/**
 * The configuration value for an element of given name may either be
 * an `ElementFilterRule` which will be taken as one-way `toData` transformation
 * or a two-way configuration of type `ToDataAndViewConfiguration`.
 */
export type ElementsFilterRuleSetConfigurationValueType = ElementFilterRule | ToDataAndViewConfiguration;

/**
 * Type for elements configuration.
 */
export interface ElementsFilterRuleSetConfiguration {
  [key: string]: ElementFilterRule | ToDataAndViewConfiguration
}

/**
 * Custom Configuration for toData/toView Rules.
 */
export interface FilterRuleSetConfiguration {
  elements?: ElementsFilterRuleSetConfiguration;
}

export function parseFilterRuleSetConfiguration(filterRuleSetConfiguration?: FilterRuleSetConfiguration,
                                                toDataDefault: FilterRuleSet = {},
                                                toViewDefault: FilterRuleSet = {}): ToDataAndView {
  if (!filterRuleSetConfiguration) {
    return {
      toData: toDataDefault,
      toView: toViewDefault,
    };
  }
  return new FilterRuleSetConfigurationParser(filterRuleSetConfiguration, toDataDefault, toViewDefault).parse();
}

class FilterRuleSetConfigurationParser {
  private static readonly toDataMergeStrategy = FilterRuleSetConfigurationParser.parentChildRule;
  private static readonly toViewMergeStrategy = FilterRuleSetConfigurationParser.sequentialRules;

  private readonly configuration: FilterRuleSetConfiguration;
  private readonly parsedToData: FilterRuleSet;
  private readonly parsedToView: FilterRuleSet;


  constructor(configuration: FilterRuleSetConfiguration, toDataDefault: FilterRuleSet, toViewDefault: FilterRuleSet) {
    this.configuration = configuration;
    this.parsedToData = toDataDefault;
    this.parsedToView = toViewDefault;
  }

  parse(): ToDataAndView {
    const elementsConfiguration: ElementsFilterRuleSetConfiguration | undefined = this.configuration.elements;
    if (elementsConfiguration) {
      this.parseElements(elementsConfiguration);
    }
    return {
      toData: this.parsedToData,
      toView: this.parsedToView,
    }
  }

  private parseElements(elementsConfiguration: ElementsFilterRuleSetConfiguration): void {
    Object.keys(elementsConfiguration).forEach((key: string) => {
      const configurationValue: ElementsFilterRuleSetConfigurationValueType = elementsConfiguration[key];
      if (typeof configurationValue === "function") {
        const elementFilterRule: ElementFilterRule = configurationValue;
        FilterRuleSetConfigurationParser.addElementsFilterRule(this.parsedToData, key, elementFilterRule, FilterRuleSetConfigurationParser.toDataMergeStrategy);
      } else {
        const toDataAndView: ToDataAndViewConfiguration = configurationValue;
        FilterRuleSetConfigurationParser.addElementsFilterRule(this.parsedToData, key, toDataAndView.toData, FilterRuleSetConfigurationParser.toViewMergeStrategy);
        this.mergeToViewConfiguration(key, toDataAndView.toView);
      }
    });
  }

  private mergeToViewConfiguration(toDataKey: string, toViewConfig: ElementFilterRule | ElementsFilterRuleSet | FilterRuleSet | undefined): void {
    if (!toViewConfig) {
      return;
    }
    if (typeof toViewConfig === "function") {
      // We add to the same key as for the toData mapping. Typical use case are
      // elements which just get their elements mapped back and forth.
      const filterRule: ElementFilterRule = toViewConfig;
      FilterRuleSetConfigurationParser.addElementsFilterRule(this.parsedToView, toDataKey, filterRule, FilterRuleSetConfigurationParser.toViewMergeStrategy);
    } else {
      const elements: ElementsFilterRuleSet = <ElementsFilterRuleSet>toViewConfig;
      Object.keys(elements).forEach((toViewKey: string) => {
        FilterRuleSetConfigurationParser.addElementsFilterRule(this.parsedToView, toViewKey, elements[toViewKey], FilterRuleSetConfigurationParser.toViewMergeStrategy);
      });
    }
  }

  private static addElementsFilterRule(ruleSet: FilterRuleSet,
                                       key: string,
                                       filterRule: ElementFilterRule | undefined,
                                       mergeStrategy: (rule1: ElementFilterRule, rule2: ElementFilterRule) => ElementFilterRule): void {
    if (!filterRule) {
      return;
    }
    if (!ruleSet.elements) {
      ruleSet.elements = {};
    }
    if (!ruleSet.elements.hasOwnProperty(key)) {
      ruleSet.elements[key] = filterRule;
    } else {
      const existingFilterRule: ElementFilterRule = ruleSet.elements[key];
      ruleSet.elements[key] = mergeStrategy(existingFilterRule, filterRule);
    }
  }

  private static parentChildRule(parentRule: ElementFilterRule, childRule: ElementFilterRule): ElementFilterRule {
    return (params: ElementFilterParams) => {
      return childRule({ ...params, parentRule: parentRule });
    }
  }

  private static sequentialRules(firstRule: ElementFilterRule, secondRule: ElementFilterRule): ElementFilterRule {
    return (params: ElementFilterParams) => {
      firstRule(params);
      secondRule(params);
    }
  }
}
