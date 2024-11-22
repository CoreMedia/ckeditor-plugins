import { LinkAttributes } from "./LinkAttributes";
import { RegisterAttributeConfig } from "./RegisterAttributeConfig";
declare module "ckeditor5" {
  interface PluginsMap {
    [LinkAttributes.pluginName]: LinkAttributes;
  }
}
declare module "ckeditor5" {
  interface LinkConfig {
    /**
     * Configuration of attributes, that should be handled as belonging to
     * a link. That is, they will benefit from, for example, the so-called
     * `two-step-caret-movement` and they will be removed, when triggering
     * unlink command.
     */
    attributes?: RegisterAttributeConfig[];
  }
}
