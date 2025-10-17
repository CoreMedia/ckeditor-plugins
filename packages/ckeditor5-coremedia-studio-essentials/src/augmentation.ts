import type CoreMediaStudioEssentials from "./CoreMediaStudioEssentials";

declare module "ckeditor5" {
  interface PluginsMap {
    [CoreMediaStudioEssentials.pluginName]: CoreMediaStudioEssentials;
  }
}
