import { BBCode } from "./index";
declare module "ckeditor5" {
  interface PluginsMap {
    [BBCode.pluginName]: BBCode;
  }
}
