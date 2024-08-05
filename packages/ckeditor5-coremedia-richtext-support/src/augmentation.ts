import {
  COREMEDIA_RICHTEXT_SUPPORT_CONFIG_KEY,
  CoreMediaRichTextSupportConfig,
  GeneralRichTextSupport,
  RichTextDataFilter,
} from "./index";
declare module "ckeditor5" {
  interface EditorConfig {
    /**
     * The configuration for General Rich Text Support. To be used, especially
     * if you do not want to get Markup cleaned up from elements or attributes
     * that are not supported in the editor instance.
     */
    [COREMEDIA_RICHTEXT_SUPPORT_CONFIG_KEY]?: CoreMediaRichTextSupportConfig;
  }
  interface PluginsMap {
    [GeneralRichTextSupport.pluginName]: GeneralRichTextSupport;
    [RichTextDataFilter.pluginName]: RichTextDataFilter;
  }
}
