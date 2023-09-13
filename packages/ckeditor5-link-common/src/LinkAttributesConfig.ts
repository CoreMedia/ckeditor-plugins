import { isRegisterAttributeConfig, RegisterAttributeConfig } from "./RegisterAttributeConfig";
import { Config } from "@ckeditor/ckeditor5-utils";
import { EditorConfig } from "@ckeditor/ckeditor5-core/src/editor/editorconfig";

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
  return { attributes };
};
