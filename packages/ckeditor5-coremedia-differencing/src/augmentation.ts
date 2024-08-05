// noinspection JSUnusedGlobalSymbols
import type {
  Differencing,
  HtmlImageElementSupport,
  ImageElementSupport,
  PluginIntegrationHook,
  RichTextDataProcessorIntegration,
} from "./index";
declare module "ckeditor5" {
  interface PluginsMap {
    [Differencing.pluginName]: Differencing;
    [HtmlImageElementSupport.pluginName]: HtmlImageElementSupport;
    [ImageElementSupport.pluginName]: ImageElementSupport;
    [PluginIntegrationHook.pluginName]: PluginIntegrationHook;
    [RichTextDataProcessorIntegration.pluginName]: RichTextDataProcessorIntegration;
  }
}
