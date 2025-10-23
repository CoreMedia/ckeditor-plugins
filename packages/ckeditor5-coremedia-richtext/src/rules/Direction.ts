import type { RuleConfig, RuleSectionConfig } from "@coremedia/ckeditor5-dom-converter";

/**
 * Direction for mapping to apply.
 *
 * * `toData`: the transformation is only applied from data view to data
 * * `toView`: the transformation is only applied from data to data view
 * * `bijective`: the transformation is applied from data view to data and vice versa
 */
export type Direction = "toData" | "toView" | "bijective";

/**
 * If the direction includes `toData` mapping.
 *
 * @param direction - direction to analyze
 */
export const includesToData = (direction: Direction): boolean => ["toData", "bijective"].includes(direction);

/**
 * If the direction includes `toView` mapping.
 *
 * @param direction - direction to analyze
 */
export const includesToView = (direction: Direction): boolean => ["toView", "bijective"].includes(direction);

export type RuleSectionConfigSupplier = () => RuleSectionConfig;

export const ifIncludesToData = (
  direction: Direction,
  supplier: RuleSectionConfigSupplier,
): RuleSectionConfig | undefined => {
  if (includesToData(direction)) {
    return supplier();
  }
  return undefined;
};

export const ifIncludesToView = (
  direction: Direction,
  supplier: RuleSectionConfigSupplier,
): RuleSectionConfig | undefined => {
  if (includesToView(direction)) {
    return supplier();
  }
  return undefined;
};

export interface ResolveDirectionToConfigConfig {
  direction: Direction;
  toData: RuleSectionConfigSupplier;
  toView: RuleSectionConfigSupplier;
  ruleDefaults?: Omit<RuleConfig, "toData" | "toView">;
}

export const defaultResolveDirectionToConfigConfig: Required<
  Omit<ResolveDirectionToConfigConfig, "direction" | "toData" | "toView">
> = {
  ruleDefaults: {},
};

export const resolveDirectionToConfig = (config: ResolveDirectionToConfigConfig): RuleConfig => {
  const { direction, toData, toView, ruleDefaults } = {
    ...defaultResolveDirectionToConfigConfig,
    ...config,
  };
  const ruleConfig: Partial<RuleConfig> = ruleDefaults;
  ruleConfig.toData = ifIncludesToData(direction, toData);
  ruleConfig.toView = ifIncludesToView(direction, toView);
  if (!ruleConfig.toData && !ruleConfig.toView) {
    // Should not happen, but just to ensure, we don't do anything wrong here.
    throw new Error("Illegal State: Neither resolved to toData nor to toView section");
  }
  // We may now safely cast.
  return ruleConfig as RuleConfig;
};
