import { Plugin } from "@ckeditor/ckeditor5-core";
import { priorities } from "@ckeditor/ckeditor5-utils";
import Logger from "@coremedia/ckeditor5-logging/logging/Logger";
import LoggerProvider from "@coremedia/ckeditor5-logging/logging/LoggerProvider";
import { reportInitEnd, reportInitStart } from "@coremedia/ckeditor5-core-common/Plugins";

/**
 * This plugin provides an extension point, to wait for (optional)
 * plugins to be available in that way, that especially, their
 * schema registrations got applied.
 *
 * It is based on a similar approach for CKEditor 5 GHS Plugin and
 * a workaround for issue
 * [ckeditor/ckeditor5#12199](https://github.com/ckeditor/ckeditor5/issues/12199)
 * to provide some better integration point.
 */
export class PluginIntegrationHook extends Plugin {
  static readonly pluginName = "PluginIntegrationHook";
  static readonly #logger: Logger = LoggerProvider.getLogger(PluginIntegrationHook.pluginName);

  init(): void {
    const initInformation = reportInitStart(this);
    this.#registerElementsAfterInit();
    reportInitEnd(initInformation);
  }

  /**
   * Listens to CKEditor instance, when data got initialized, and we know, that
   * all previous schema registrations got applied.
   */
  #registerElementsAfterInit(): void {
    const logger = PluginIntegrationHook.#logger;
    logger.debug("Applying data.init listener.");
    // See DataFilter of GHS.
    this.editor.data.on(
      "init",
      () => {
        logger.debug("Received data.init event. Triggering plugin integrations.");
        this.#firePluginRegistration("ready");
      },
      {
        // With the highest priority listener we can register elements right
        // before running data conversion. Also:
        // * Make sure that priority is higher than the one used by
        //   `RealTimeCollaborationClient`, as RTC is stopping event
        //   propagation.
        priority: priorities.get("highest") + 1,
      }
    );
  }

  #firePluginRegistration(state: string) {
    this.fire(`plugin-integration:${state}`);
  }
}
