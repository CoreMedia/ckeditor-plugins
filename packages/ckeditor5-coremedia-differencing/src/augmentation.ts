import type Differencing from "./Differencing";
import type { HtmlImageElementSupport } from "./integrations/HtmlSupportImage";
import type { ImageElementSupport } from "./integrations/Image";
import type { RichTextDataProcessorIntegration } from "./integrations/RichTextDataProcessorIntegration";
import type { PluginIntegrationHook } from "./PluginIntegrationHook";

declare module "ckeditor5" {
  interface PluginsMap {
    [Differencing.pluginName]: Differencing;
    [HtmlImageElementSupport.pluginName]: HtmlImageElementSupport;
    [ImageElementSupport.pluginName]: ImageElementSupport;
    [PluginIntegrationHook.pluginName]: PluginIntegrationHook;
    [RichTextDataProcessorIntegration.pluginName]: RichTextDataProcessorIntegration;
  }
}
