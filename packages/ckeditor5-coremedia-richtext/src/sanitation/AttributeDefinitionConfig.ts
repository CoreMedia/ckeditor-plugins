import type { ActiveStrictness } from "../Strictness";
import { isKnownNamespacePrefix, namespaces } from "../Namespaces";
import type { AttributeContent } from "./AttributeContent";
import { acAny } from "./AttributeContent";

/**
 * Definition of an attribute, closely related to DTD definition.
 */
export interface AttributeDefinitionConfig {
  /**
   * The local name of an attribute.
   */
  localName: string;
  /**
   * The prefix of an attribute. `null` none.
   */
  prefix?: string | null;
  /**
   * Namespace URI of attribute. If unset, it may be guessed from prefix if it
   * is a well-known prefix.
   */
  namespaceURI?: string | null;
  /**
   * If required and missing: Use the given value as default value.
   */
  required?: string | false;
  /**
   * If the value is fixed. It is expected that at least strict validation
   * would consider any other value despite the fixed value as invalid.
   */
  fixed?: string | null;
  /**
   * Defines valid attribute value types.
   */
  content?: AttributeContent;
  /**
   * Validate a given value. By default forwards to attribute content
   * definition.
   *
   * @param value - value to validate
   * @param strictness - strictness level to respect
   */
  validateValue?: (value: string | null, strictness: ActiveStrictness) => boolean;
}

/**
 * Parsed attribute definition with all fields set.
 */
export type ParsedAttributeDefinitionConfig = Required<AttributeDefinitionConfig>;

/**
 * Parses the given attribute definition applying reasonable defaults.
 *
 * @param config - configuration to parse
 */
export const parseAttributeDefinitionConfig = (config: AttributeDefinitionConfig): ParsedAttributeDefinitionConfig => {
  const content = config.content ?? acAny;
  const prefix = config.prefix ?? null;
  // Simplified to fall back to default namespace. May need to be adjusted if
  // we want to provide more sophisticated namespace support.
  let namespaceURI = config.namespaceURI ?? namespaces.default;
  if (!namespaceURI && isKnownNamespacePrefix(prefix)) {
    namespaceURI = namespaces[prefix];
  }
  return {
    prefix,
    namespaceURI,
    required: false,
    fixed: null,
    content,
    validateValue: (value: string | null, strictness: ActiveStrictness): boolean =>
      content.validateValue(value, strictness),
    ...config,
  };
};
