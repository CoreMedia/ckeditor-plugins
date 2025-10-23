import type FontMapper from "./FontMapper";
import type { FontMapperConfig, COREMEDIA_FONT_MAPPER_CONFIG_KEY } from "./FontMapperConfig";

declare module "ckeditor5" {
  interface EditorConfig {
    [COREMEDIA_FONT_MAPPER_CONFIG_KEY]?: FontMapperConfig;
  }

  interface PluginsMap {
    [FontMapper.pluginName]: FontMapper;
  }
}
