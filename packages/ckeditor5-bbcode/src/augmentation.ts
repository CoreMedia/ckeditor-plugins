import { BBCode } from "./BBCode";

declare module "ckeditor5" {
  interface PluginsMap {
    [BBCode.pluginName]: BBCode;
  }
}
