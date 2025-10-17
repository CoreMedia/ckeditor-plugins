import type { COREMEDIA_RICHTEXT_CONFIG_KEY } from "./CoreMediaRichTextConfig";
import type CoreMediaRichTextConfig from "./CoreMediaRichTextConfig";
import type CoreMediaRichText from "./CoreMediaRichText";
import type { LinkIntegration } from "./integrations/LinkIntegration";

declare module "ckeditor5" {
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
