import { ElementFilterRulesByName, FilterRuleSet } from "./HtmlFilter";
import { ElementFilterParams, ElementFilterRule } from "./ElementProxy";
import { TextFilterParams, TextFilterRule } from "./TextProxy";

const parentChildElementRule =
  (parentRule: ElementFilterRule, childRule: ElementFilterRule): ElementFilterRule =>
  (params: ElementFilterParams) =>
    childRule({ ...params, parentRule });

const parentChildTextRule =
  (parentRule: TextFilterRule, childRule: TextFilterRule): TextFilterRule =>
  (params: TextFilterParams) =>
    childRule({ ...params, parentRule });

/**
 * This represents the combination of toData/toView.
 */
interface ParsedToDataAndView {
  toData: FilterRuleSet;
  toView: FilterRuleSet;
}

/**
 * Interface for separate toData/toView Handling within the configuration.
 */
interface ToDataAndViewElementConfiguration {
  toData?: ElementFilterRule;
  toView?: ElementFilterRule | ElementFilterRulesByName;
}

interface ToDataAndViewTextConfiguration {
  toData?: TextFilterRule;
  toView?: TextFilterRule;
}

/**
 * The configuration value for an element of given name may either be
 * an `ElementFilterRule` which will be taken as one-way `toData` transformation
 * or a two-way configuration of type `ToDataAndViewConfiguration`.
 */
type ElementsFilterRuleSetConfigurationValueType = ElementFilterRule | ToDataAndViewElementConfiguration;

/**
 * Type for elements configuration.
 */
type ElementsFilterRuleSetConfiguration = Record<string, ElementsFilterRuleSetConfigurationValueType>;

type TextFilterRuleSetConfigurationValueType = TextFilterRule | ToDataAndViewTextConfiguration;

/**
 * Custom Configuration for toData/toView Rules. A general concept is, that the
 * HTML representation in CKEditor takes the lead. This again results from a
 * primary perspective from HTML to data representation (`toData`). That's
 * why simpler configuration options will represent the `toData`
 * representation.
 *
 *  **Example:** If you add an element mapping, like
 * `{ h1: mapH1Fn }` it will be used as `toData` rule only. If, for any reason,
 * you require a `toView` mapping only, configuration needs to be more
 * complicated: `{ h1: { toView: mapH1Fn } }`.
 *
 * This is similar for text rules.
 *
 *  **Example:** If you add a text mapping, like
 * `{ text: mapTextFn }` it will be used as `toData` rule only. If, for any
 * reason, you require a `toView` mapping only, configuration needs to be more
 * complicated: `{ text: { toView: mapTextFn } }`.
 *
 *  **Sequential vs. Hierarchical Rules:** Because of the
 * precedence of the `toData` transformation, for one given configuration, is
 * always unique. You cannot add for example multiple mappings within one
 * configuration for `<h1>`. In contrast, the `toView` representation might
 * be parsed to multiple independent mappings for the same element.
 *
 * That's why rules for `toData` are executed in a hierarchical way. For rule
 * configured within CKEditor configuration it will be typically called having
 * a parent rule set, which is the default rule to apply. This provides the
 * option to completely override the behavior for the `toData` transformation.
 *
 * In contrast to parsed `toData`, the `toView` elements are executed
 * sequentially.
 */
interface FilterRuleSetConfiguration {
  elements?: ElementsFilterRuleSetConfiguration;
  text?: TextFilterRuleSetConfigurationValueType;
}

const mergePreParsedToViews = (preParsedConfig: PreParsedToView): FilterRuleSet => {
  const mergedResult: FilterRuleSet = {};

  const mergePreParsedElementSections = (customElementsConfig: PreParsedElementSection): ElementFilterRulesByName => {
    const elementsResult: ElementFilterRulesByName = {};
    const allToViewKeys = Object.keys(customElementsConfig);
    allToViewKeys.forEach((key) => {
      const customSection: ElementFilterRulesByName = customElementsConfig[key] || {};
      const rules = Object.keys(customSection).map((customKey) => customSection[customKey]);
      elementsResult[key] = (params) => {
        rules.forEach((r) => r(params));
      };
    });
    return elementsResult;
  };

  if (preParsedConfig.text) {
    mergedResult.text = preParsedConfig.text;
  }

  if (preParsedConfig.elements) {
    mergedResult.elements = mergePreParsedElementSections(preParsedConfig.elements);
  }
  return mergedResult;
};

const parseFilterRuleSetConfigurations = (
  customFilterRuleSetConfiguration?: FilterRuleSetConfiguration,
  defaultFilterRuleSetConfiguration?: FilterRuleSetConfiguration,
): ParsedToDataAndView => {
  const preParsedDefault = new FilterRuleSetConfigurationParser(defaultFilterRuleSetConfiguration ?? {}).parse();
  const preParsedToDataAndView: PreParsedToDataAndView = new FilterRuleSetConfigurationParser(
    customFilterRuleSetConfiguration ?? {},
    preParsedDefault,
  ).parse();
  const preParsedToView: PreParsedToView = preParsedToDataAndView.toView;
  return {
    toData: preParsedToDataAndView.toData,
    toView: mergePreParsedToViews(preParsedToView),
  };
};

/**
 *
 * Pre-parsed `toView` representation, which still knows the `toData` section
 * a given rule originated from. This allows to handle `toView` mappings from
 * the same `toData` element (from default and custom config) in a different
 * way, then those, which exist  _in parallel_, i.e., those, which were
 * created by different `toData` nodes.
 *
 * The suggested approach is to merge mappings originating from the same
 * `toData` elements hierarchically, while those from different `toData` nodes
 * will be merged sequentially. Or, from the perspective of the rules: For
 * hierarchical rules, a rule can block the other (parent), while in sequential
 * execution they all exist with the same priority in parallel.
 *
 * The mapping is as follows:
 *
 * * `toView` key (i.e., data element to transform)
 *
 *     * `toData` key (i.e., original `toData` section)
 *
 *         A special key `" "` (single whitespace) is used for those `toView`
 *         mappings, where no corresponding `toData` mapping exists.
 */
interface PreParsedToView {
  elements?: PreParsedElementSection;
  text?: TextFilterRule;
}

type PreParsedElementSection = Record<string, ElementFilterRulesByName>;

interface PreParsedToDataAndView {
  toData: FilterRuleSet;
  toView: PreParsedToView;
}

class FilterRuleSetConfigurationParser {
  readonly #configuration: FilterRuleSetConfiguration;
  readonly #parsedToData: FilterRuleSet;
  readonly #preParsedToView: PreParsedToView;

  constructor(configuration: FilterRuleSetConfiguration, preParsedDefault?: PreParsedToDataAndView) {
    this.#configuration = configuration;
    this.#parsedToData = preParsedDefault?.toData ?? {};
    this.#preParsedToView = preParsedDefault?.toView ?? {};
  }

  parse(): PreParsedToDataAndView {
    const elementsConfiguration: ElementsFilterRuleSetConfiguration | undefined = this.#configuration.elements;
    if (elementsConfiguration) {
      this.#parseElements(elementsConfiguration);
    }
    const textConfiguration: TextFilterRule | ToDataAndViewTextConfiguration | undefined = this.#configuration.text;
    if (textConfiguration) {
      this.#parseText(textConfiguration);
    }
    return {
      toData: this.#parsedToData,
      toView: this.#preParsedToView,
    };
  }

  #parseText(textConfiguration: TextFilterRuleSetConfigurationValueType): void {
    if (typeof textConfiguration === "function") {
      const textFilterRule: TextFilterRule = textConfiguration;
      this.#addToDataTextFilterRule(textFilterRule);
    } else {
      const toDataAndView: ToDataAndViewTextConfiguration = textConfiguration;
      this.#addToDataTextFilterRule(toDataAndView.toData);
      this.#addToViewTextFilterRule(toDataAndView.toView);
    }
  }

  #addToViewTextFilterRule(textFilterRule: TextFilterRule | undefined): void {
    if (!textFilterRule) {
      return;
    }
    if (this.#preParsedToView.text) {
      this.#preParsedToView.text = parentChildTextRule(this.#preParsedToView.text, textFilterRule);
    } else {
      this.#preParsedToView.text = textFilterRule;
    }
  }

  #parseElements(elementsConfiguration: ElementsFilterRuleSetConfiguration): void {
    Object.keys(elementsConfiguration).forEach((key: string) => {
      const configurationValue: ElementsFilterRuleSetConfigurationValueType = elementsConfiguration[key];
      if (typeof configurationValue === "function") {
        // We only have a `toData` mapping.
        const elementFilterRule: ElementFilterRule = configurationValue;
        this.#addToDataElementsFilterRule(key, elementFilterRule);
      } else {
        // We have a `toData` and separate `toView` mapping.
        const toDataAndView: ToDataAndViewElementConfiguration = configurationValue;
        this.#addToDataElementsFilterRule(key, toDataAndView.toData);
        // Needs to signal, if bound to toData....
        this.#mergeToViewElementsConfiguration(key, toDataAndView.toView, !!toDataAndView.toData);
      }
    });
  }

  /**
   * Artificial key for views not bound to any `toData` transformation, thus,
   * only `toView` mapping exists. As for a given element tag name only one such
   * rule can exist, it is enough just having one key — it is even required
   * to have one key, so that merging a custom configuration with a default
   * configuration applies parentChild-relation-ship to these rules.
   */
  static readonly #UNBOUND_TO_VIEW_KEY = " ";

  #mergeToViewElementsConfiguration(
    toDataKey: string,
    toViewConfig: ElementFilterRule | ElementFilterRulesByName | undefined,
    hasToData: boolean,
  ): void {
    if (!toViewConfig) {
      return;
    }
    const toDataKeyOrUnbound: string = hasToData ? toDataKey : FilterRuleSetConfigurationParser.#UNBOUND_TO_VIEW_KEY;
    if (typeof toViewConfig === "function") {
      // We add to the same key as for the toData mapping. Typical use case are
      // elements, which just get their elements mapped back and forth.
      const filterRule: ElementFilterRule = toViewConfig;
      const toViewKey: string = toDataKey;
      this.#addPreParsedToViewElementsRule(toViewKey, toDataKeyOrUnbound, filterRule);
    } else {
      const elements: ElementFilterRulesByName = toViewConfig;
      Object.keys(elements).forEach((toViewKey: string) => {
        this.#addPreParsedToViewElementsRule(toViewKey, toDataKeyOrUnbound, elements[toViewKey]);
      });
    }
  }

  #addPreParsedToViewElementsRule(
    toViewKey: string,
    toDataKey: string,
    filterRule: ElementFilterRule | undefined,
  ): void {
    if (!filterRule) {
      return;
    }
    const preParsedRules = this.#preParsedToView;
    if (!preParsedRules.elements) {
      preParsedRules.elements = {};
    }
    if (preParsedRules.elements.hasOwnProperty(toViewKey)) {
      if (preParsedRules.elements[toViewKey].hasOwnProperty(toDataKey)) {
        const existingFilterRule = preParsedRules.elements[toViewKey][toDataKey];
        preParsedRules.elements[toViewKey][toDataKey] = parentChildElementRule(existingFilterRule, filterRule);
      } else {
        preParsedRules.elements[toViewKey][toDataKey] = filterRule;
      }
    } else {
      preParsedRules.elements[toViewKey] = {
        toDataKey: filterRule,
      };
    }
  }

  #addToDataTextFilterRule(textFilterRule: TextFilterRule | undefined): void {
    if (!textFilterRule) {
      return;
    }
    if (this.#parsedToData.text) {
      this.#parsedToData.text = parentChildTextRule(this.#parsedToData.text, textFilterRule);
    } else {
      this.#parsedToData.text = textFilterRule;
    }
  }

  #addToDataElementsFilterRule(key: string, filterRule: ElementFilterRule | undefined): void {
    if (!filterRule) {
      return;
    }
    const ruleSet = this.#parsedToData;
    if (!ruleSet.elements) {
      ruleSet.elements = {};
    }
    if (ruleSet.elements.hasOwnProperty(key)) {
      const existingFilterRule: ElementFilterRule = ruleSet.elements[key];
      ruleSet.elements[key] = parentChildElementRule(existingFilterRule, filterRule);
    } else {
      ruleSet.elements[key] = filterRule;
    }
  }
}

export {
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
  mergePreParsedToViews,
  parseFilterRuleSetConfigurations,
};
