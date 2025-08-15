import Differencing from "./Differencing";
import { HtmlImageElementSupport } from "./integrations/HtmlSupportImage";
import { ImageElementSupport } from "./integrations/Image";
import { RichTextDataProcessorIntegration } from "./integrations/RichTextDataProcessorIntegration";
import { PluginIntegrationHook } from "./PluginIntegrationHook";

declare module "ckeditor5" {
  interface PluginsMap {
    [Differencing.pluginName]: Differencing;
    [HtmlImageElementSupport.pluginName]: HtmlImageElementSupport;
    [ImageElementSupport.pluginName]: ImageElementSupport;
    [PluginIntegrationHook.pluginName]: PluginIntegrationHook;
    [RichTextDataProcessorIntegration.pluginName]: RichTextDataProcessorIntegration;
  }
}
