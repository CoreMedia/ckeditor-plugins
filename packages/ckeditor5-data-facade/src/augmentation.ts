import type { DataFacade } from "./DataFacade";
import type { DataFacadeConfig } from "./DataFacadeConfig";

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
