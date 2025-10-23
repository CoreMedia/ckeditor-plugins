import type { Config, EditorConfig } from "ckeditor5";
import type { RegisterAttributeConfig } from "./RegisterAttributeConfig";
import { isRegisterAttributeConfig } from "./RegisterAttributeConfig";

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
export const parseAttributesConfig = (config: Config<EditorConfig>): LinkAttributesConfig => {
  const pluginConfig = config.get("link.attributes");
  if (!pluginConfig) {
    return emptyConfig();
  }
  if (!Array.isArray(pluginConfig)) {
    throw new Error(
      `link.attributes: Unexpected configuration. Array expected but is: ${JSON.stringify(pluginConfig)}`,
    );
  }
  const attributes: RegisterAttributeConfig[] = [];
  pluginConfig.forEach((entry: unknown): void => {
    if (isRegisterAttributeConfig(entry)) {
      attributes.push(entry);
    }
  });
  return {
    attributes,
  };
};
