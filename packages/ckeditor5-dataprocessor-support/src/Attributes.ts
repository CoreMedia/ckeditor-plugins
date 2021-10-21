import { ElementFilterParams, ElementFilterRule } from "./ElementProxy";

/**
 * Mapper for attributes from view to data (`toData`) and vice versa (`toView`).
 */
interface AttributeMapper {
  toData: ElementFilterRule;
  toView: ElementFilterRule;
}

/**
 * Renames the given attribute to the given new name. `aliases` represent
 * alternative names. Given a list of `[name, ...aliases]` the first existing
 * value will be used for the target name. All attributes in that combined
 * list will be removed.
 *
 * @param node node to handle attributes for
 * @param name the original name to rename
 * @param targetName the new name of the attribute
 * @param aliases possible alternative original names
 */
const renameAttribute = (
  { node }: ElementFilterParams,
  name: string,
  targetName: string,
  ...aliases: string[]
): void => {
  const allNames = [name, ...aliases];
  const attributes = node.attributes;
  const firstExistingIndex = allNames.findIndex((n) => attributes.hasOwnProperty(n) && attributes[n] != null);
  if (firstExistingIndex === -1) {
    // Nothing to do.
    return;
  }
  const firstExistingName = allNames[firstExistingIndex];
  const value: string = attributes[firstExistingName] || "";
  // Remove non-existing attribute names.
  allNames.splice(0, firstExistingIndex);
  allNames.forEach((n) => delete attributes[n]);
  node.attributes[targetName] = value;
};

/**
 * Preserves the given data attribute as the given view attribute. Thus, it
 * provides a mapper for `toView` renaming attribute given by `dataAttributeName`
 * to attribute named `viewAttributeName`.
 *
 * If a data attribute has alias names, you may specify them in `dataAttributeAliases`.
 * Note, that the first existing attributes value in `[dataAttributeName, ...dataAttributeAliases]`
 * will be taken into account. All other attributes will be lost in this processing.
 *
 * @example Simple Use Case
 * Mapper to store data attribute `xlink:type` in view as `data-xlink-type`:
 * ```typescript
 * mapper = preserveAttributeAs("xlink:type", "data-xlink-type");
 * ```
 * @example Extended Use Case
 * Mapper to store data attribute `lang` with alias `xml:lang` in view as `lang`:
 * ```typescript
 * mapper = preserveAttributeAs("lang", "lang", "xml:lang");
 * ```
 *
 * @param dataAttributeName
 * @param viewAttributeName
 * @param dataAttributeAliases
 */
const preserveAttributeAs = (
  dataAttributeName: string,
  viewAttributeName: string,
  ...dataAttributeAliases: string[]
): AttributeMapper => {
  return {
    toData: (params) => renameAttribute(params, viewAttributeName, dataAttributeName),
    toView: (params) => renameAttribute(params, dataAttributeName, viewAttributeName, ...dataAttributeAliases),
  };
};

/**
 * Combines all attribute mappers into one.
 *
 * @param mappers attribute mappers to combine
 */
const allAttributeMappers = (...mappers: AttributeMapper[]): AttributeMapper => {
  return {
    toData: (params) => mappers.forEach((m) => m.toData(params)),
    toView: (params) => mappers.forEach((m) => m.toView(params)),
  };
};

const asDataFilterRule = (mapper: AttributeMapper): ElementFilterRule => {
  return (params) => mapper.toData(params);
};

const asViewFilterRule = (mapper: AttributeMapper): ElementFilterRule => {
  return (params) => mapper.toView(params);
};

export {
  AttributeMapper,
  renameAttribute,
  preserveAttributeAs,
  allAttributeMappers,
  asDataFilterRule,
  asViewFilterRule,
};
