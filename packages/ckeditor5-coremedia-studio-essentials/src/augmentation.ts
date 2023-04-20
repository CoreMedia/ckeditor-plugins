import { CoreMediaStudioEssentials } from "./index";

declare module "@ckeditor/ckeditor5-core" {
  interface PluginsMap {
    [CoreMediaStudioEssentials.pluginName]: CoreMediaStudioEssentials;
  }
}
