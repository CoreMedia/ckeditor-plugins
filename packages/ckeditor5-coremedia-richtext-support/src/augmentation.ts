import CoreMediaRichTextSupportConfig, {
  COREMEDIA_RICHTEXT_SUPPORT_CONFIG_KEY,
} from "./CoreMediaRichTextSupportConfig";
import GeneralRichTextSupport from "./GeneralRichTextSupport";
import RichTextDataFilter from "./RichTextDataFilter";

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
