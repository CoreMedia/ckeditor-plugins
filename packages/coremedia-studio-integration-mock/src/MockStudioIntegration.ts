import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import MockContentDisplayService from "./content/MockContentDisplayService";
import { serviceAgent } from "@coremedia/studio-apps-service-agent";
import { Logger, LoggerProvider } from "@coremedia/coremedia-utils/src";

const PLUGIN_NAME = "MockStudioIntegration";

/**
 * Plugin to provide mocked CoreMedia Studio Integration.
 */
class MockStudioIntegration extends Plugin {
  static readonly pluginName: string = PLUGIN_NAME;
  readonly #logger: Logger = LoggerProvider.getLogger(PLUGIN_NAME);

  init(): Promise<void> | null {
    const startTimestamp = performance.now();

    this.#logger.info(`Initializing ${MockStudioIntegration.pluginName}...`);

    const service = new MockContentDisplayService();
    serviceAgent.registerService(service);

    this.#logger.info(
      `Initialized ${MockStudioIntegration.pluginName} within ${performance.now() - startTimestamp} ms.`
    );

    return null;
  }
}

export default MockStudioIntegration;
