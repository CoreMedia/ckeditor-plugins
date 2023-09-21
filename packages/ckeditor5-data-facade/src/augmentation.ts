import type { DataFacade, DataFacadeConfig } from "./index";

declare module "@ckeditor/ckeditor5-core" {
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
