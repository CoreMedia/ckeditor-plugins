import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import MockContentDisplayService from "./content/MockContentDisplayService";
import MockRichtextConfigurationService from "./content/MockRichtextConfigurationService";

import { ServiceAgent, serviceAgent } from "@coremedia/service-agent";
import Logger from "@coremedia/ckeditor5-logging/logging/Logger";
import LoggerProvider from "@coremedia/ckeditor5-logging/logging/LoggerProvider";
import MockDragDropService from "./content/MockDragDropService";
import MockWorkAreaService from "./content/MockWorkAreaService";
import MockBlobDisplayService from "./content/MockBlobDisplayService";

const PLUGIN_NAME = "MockStudioIntegration";

/**
 * Plugin to provide mocked CoreMedia Studio Integration.
 */
class MockStudioIntegration extends Plugin {
  static readonly pluginName: string = PLUGIN_NAME;
  static readonly #logger: Logger = LoggerProvider.getLogger(PLUGIN_NAME);

  init(): Promise<void> | null {
    const logger = MockStudioIntegration.#logger;

    const startTimestamp = performance.now();

    logger.info(`Initializing ${MockStudioIntegration.pluginName}...`);

    const contentDisplayService = new MockContentDisplayService();
    serviceAgent.registerService(contentDisplayService);

    const richtextConfigurationService = new MockRichtextConfigurationService();
    serviceAgent.registerService(richtextConfigurationService);

    const dragDropService = new MockDragDropService();
    serviceAgent.registerService(dragDropService);

    const workAreaService = new MockWorkAreaService();
    serviceAgent.registerService(workAreaService);

    const blobDisplayService = new MockBlobDisplayService();
    serviceAgent.registerService(blobDisplayService);

    logger.info(`Initialized ${MockStudioIntegration.pluginName} within ${performance.now() - startTimestamp} ms.`);

    return null;
  }

  static getServiceAgent(): ServiceAgent {
    return serviceAgent;
  }
}

export default MockStudioIntegration;
