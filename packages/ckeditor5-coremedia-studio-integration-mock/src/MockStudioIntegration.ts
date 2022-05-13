import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import MockContentDisplayService from "./content/MockContentDisplayService";
import MockRichtextConfigurationService from "./content/MockRichtextConfigurationService";

import { ServiceAgent, serviceAgent } from "@coremedia/service-agent";
import Logger from "@coremedia/ckeditor5-logging/logging/Logger";
import LoggerProvider from "@coremedia/ckeditor5-logging/logging/LoggerProvider";
import MockDragDropService from "./content/MockDragDropService";
import MockWorkAreaService from "./content/MockWorkAreaService";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import MockContentPlugin, { MockContentProvider } from "./content/MockContentPlugin";
import MockBlobDisplayService from "./content/MockBlobDisplayService";

const PLUGIN_NAME = "MockStudioIntegration";

/**
 * Plugin to provide mocked CoreMedia Studio Integration.
 */
class MockStudioIntegration extends Plugin {
  static readonly pluginName: string = PLUGIN_NAME;
  static readonly #logger: Logger = LoggerProvider.getLogger(PLUGIN_NAME);

  static get requires(): Array<new (editor: Editor) => Plugin> {
    return [MockContentPlugin];
  }

  init(): Promise<void> | void {
    const logger = MockStudioIntegration.#logger;

    const startTimestamp = performance.now();

    logger.info(`Initializing ${MockStudioIntegration.pluginName}...`);

    const contentProvider = this.#initContents();

    const contentDisplayService = new MockContentDisplayService(contentProvider);
    serviceAgent.registerService(contentDisplayService);

    const richtextConfigurationService = new MockRichtextConfigurationService(contentProvider);
    serviceAgent.registerService(richtextConfigurationService);

    const dragDropService = new MockDragDropService();
    serviceAgent.registerService(dragDropService);

    const workAreaService = new MockWorkAreaService();
    serviceAgent.registerService(workAreaService);

    const blobDisplayService = new MockBlobDisplayService(contentProvider);
    serviceAgent.registerService(blobDisplayService);

    logger.info(`Initialized ${MockStudioIntegration.pluginName} within ${performance.now() - startTimestamp} ms.`);
  }

  #initContents(): MockContentProvider {
    const editor = this.editor;
    const contentPlugin = editor.plugins.get(MockContentPlugin);
    return contentPlugin.getContent;
  }

  static getServiceAgent(): ServiceAgent {
    return serviceAgent;
  }
}

export default MockStudioIntegration;
