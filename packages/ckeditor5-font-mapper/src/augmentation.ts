import { type FontMapper, type FontMapperConfig, COREMEDIA_FONT_MAPPER_CONFIG_KEY } from "./index";
declare module "ckeditor5" {
  interface EditorConfig {
    [COREMEDIA_FONT_MAPPER_CONFIG_KEY]?: FontMapperConfig;
  }
  interface PluginsMap {
    [FontMapper.pluginName]: FontMapper;
  }
}
