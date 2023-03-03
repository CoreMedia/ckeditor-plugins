import { isRegisterAttributeConfig, RegisterAttributeConfig } from "./RegisterAttributeConfig";
import Config from "@ckeditor/ckeditor5-utils/src/config";

/**
 * Configuration, that is expected as part of the CKEditor 5
 * link-feature configuration.
 *
 * ```typescript
 * const linkAttributesConfig: LinkAttributesConfig = {
 *   attributes: [
 *     { view: "title", model: "linkTitle" },
 *     { view: "data-xlink-actuate", model: "linkActuate" },
 *   ],
 * };
 *
 * ClassicEditor.create(sourceElement, {
 *   plugins: [
 *     LinkAttributes,
 *     Link,
 *     // ...
 *   ],
 *   link: {
 *     defaultProtocol: "https://",
 *     ...linkAttributesConfig,
 *   },
 * };
 * ```
 */
export interface LinkAttributesConfig {
  /**
   * Configuration of attributes, which are to be handled as being
   * part of a link, similar to `href` (`linkHref` in model).
   */
  attributes: RegisterAttributeConfig[];
}

/**
 * Provides an empty configuration by default.
 */
const emptyConfig = (): LinkAttributesConfig => ({
  attributes: [],
});

/**
 * Configuration parsing for link attributes.
 *
 * @param config editor configuration to parse
 */
export const parseAttributesConfig = (config: Config): LinkAttributesConfig => {
  const fromConfig: unknown = config.get("link.attributes");
  if (!fromConfig) {
    return emptyConfig();
  }
  if (!Array.isArray(fromConfig)) {
    throw new Error(`link.attributes: Unexpected configuration. Array expected but is: ${JSON.stringify(fromConfig)}`);
  }
  const attributes: RegisterAttributeConfig[] = [];
  const attributesConfig: unknown[] = fromConfig;
  attributesConfig.forEach((entry: unknown): void => {
    if (isRegisterAttributeConfig(entry)) {
      attributes.push(entry);
    }
  });
  return { attributes };
};
