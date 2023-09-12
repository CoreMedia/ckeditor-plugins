import { CoreMediaRichTextConfig, COREMEDIA_RICHTEXT_CONFIG_KEY, CoreMediaRichText, LinkIntegration } from "./index";

declare module "@ckeditor/ckeditor5-core" {
  interface EditorConfig {
    /**
     * The configuration for General Rich Text Support. To be used, especially
     * if you do not want to get Markup cleaned up from elements or attributes
     * that are not supported in the editor instance.
     */
    [COREMEDIA_RICHTEXT_CONFIG_KEY]?: CoreMediaRichTextConfig;
  }

  interface PluginsMap {
    [CoreMediaRichText.pluginName]: CoreMediaRichText;
    [LinkIntegration.pluginName]: LinkIntegration;
  }
}
