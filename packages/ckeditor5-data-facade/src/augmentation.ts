import type { DataFacade } from "./index";

declare module "@ckeditor/ckeditor5-core" {
  interface PluginsMap {
    [DataFacade.pluginName]: DataFacade;
  }
}
