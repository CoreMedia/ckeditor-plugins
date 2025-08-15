import type { DataFacade, DataFacadeConfig } from "./index";

declare module "ckeditor5" {
  interface PluginsMap {
    [DataFacade.pluginName]: DataFacade;
  }
  interface EditorConfig {
    /**
     * The configuration of the `DataFacade`.
     */
    dataFacade?: DataFacadeConfig;
  }
}
