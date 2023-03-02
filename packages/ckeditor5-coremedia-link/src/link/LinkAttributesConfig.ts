import { isRegisterAttributeConfig, RegisterAttributeConfig } from "./RegisterAttributeConfig";
import Config from "@ckeditor/ckeditor5-utils/src/config";

export interface LinkAttributesConfig {
  attributes: RegisterAttributeConfig[];
}

const emptyConfig = (): LinkAttributesConfig => ({
  attributes: [],
});

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
