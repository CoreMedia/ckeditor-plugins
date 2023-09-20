export type TargetDefaultRuleDefinition = TargetDefaultRuleDefinitionWithFilter | TargetDefaultRuleDefinitionWithType;

/**
 * A filter rule, used to check whether the given default target should be applied to the link.
 * This rule is based on a filter, which, if applies to the given url, sets the target attribute of the link.
 */
export interface TargetDefaultRuleDefinitionWithFilter {
  /**
   * Please note: Since content links and external links are the most common types to
   * have a particular link target, you can also use the "type" property to configure them directly.
   *
   * This filter would apply to all content links:
   * @example
   * ```
   * filter: (url: string) => (url ? url.startsWith("content:") : false);
   * ```
   *
   * @param url - the url of the link
   * @returns whether to apply the target to the link
   */
  filter: (url: string) => boolean;

  /**
   * The link target, that should be applied to all inserted links, that match
   * the filter rule.
   */
  target: string;
}

export type DefaultLinkType = "externalLink" | "contentLink";

/**
 * A filter rule, used to check whether the given default target should be applied to the link.
 * This rule is based on a type, that translates to a default filter rule, which sets the target attribute of the link.
 */
export interface TargetDefaultRuleDefinitionWithType {
  /**
   * The type of the link to apply the target to.
   */
  type: DefaultLinkType;

  /**
   * The link target, that should be applied to all inserted links, that match
   * the given type.
   */
  target: string;
}

/**
 * Type-guard for TargetDefaultRuleDefinitionWithFilter type
 * @param value - the variable to check
 */
export const isTargetDefaultRuleDefinitionWithFilter = (
  value: unknown,
): value is TargetDefaultRuleDefinitionWithFilter => {
  if (typeof value !== "object" || !value) {
    return false;
  }
  return !(!("filter" in value) || !("target" in value));
};

/**
 * Type-guard for TargetDefaultRuleDefinitionWithType type
 * @param value - the variable to check
 */
export const isTargetDefaultRuleDefinitionWithType = (value: unknown): value is TargetDefaultRuleDefinitionWithType => {
  if (typeof value !== "object" || !value) {
    return false;
  }
  return !(!("type" in value) || !("target" in value));
};
