// noinspection JSUnusedGlobalSymbols
import type {
  Differencing,
  HtmlImageElementSupport,
  ImageElementSupport,
  PluginIntegrationHook,
  RichTextDataProcessorIntegration,
} from "./index";

declare module "@ckeditor/ckeditor5-core" {
  interface PluginsMap {
    [Differencing.pluginName]: Differencing;
    [HtmlImageElementSupport.pluginName]: HtmlImageElementSupport;
    [ImageElementSupport.pluginName]: ImageElementSupport;
    [PluginIntegrationHook.pluginName]: PluginIntegrationHook;
    [RichTextDataProcessorIntegration.pluginName]: RichTextDataProcessorIntegration;
  }
}
