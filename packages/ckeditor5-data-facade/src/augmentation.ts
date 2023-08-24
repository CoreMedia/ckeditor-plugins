import type { CachingDataFacade } from "./index";

declare module "@ckeditor/ckeditor5-core" {
  interface PluginsMap {
    [CachingDataFacade.pluginName]: CachingDataFacade;
  }
}
