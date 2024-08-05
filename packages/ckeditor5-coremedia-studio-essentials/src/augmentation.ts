import { CoreMediaStudioEssentials } from "./index";
declare module "ckeditor5" {
  interface PluginsMap {
    [CoreMediaStudioEssentials.pluginName]: CoreMediaStudioEssentials;
  }
}
