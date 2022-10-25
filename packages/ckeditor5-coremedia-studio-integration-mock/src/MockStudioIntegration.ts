import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import MockContentDisplayService from "./content/MockContentDisplayService";
import MockRichtextConfigurationService from "./content/MockRichtextConfigurationService";

import { serviceAgent } from "@coremedia/service-agent";
import MockDragDropService from "./content/MockDragDropService";
import MockWorkAreaService from "./content/MockWorkAreaService";
import MockContentPlugin, { MockContentProvider } from "./content/MockContentPlugin";
import MockBlobDisplayService from "./content/MockBlobDisplayService";
import MockServiceAgentPlugin from "./content/MockServiceAgentPlugin";
import { reportInitEnd, reportInitStart } from "@coremedia/ckeditor5-core-common/Plugins";
import MockClipboardService from "./content/MockClipboardService";
import { createClipboardServiceDescriptor } from "@coremedia/ckeditor5-coremedia-studio-integration/content/ClipboardServiceDesriptor";

const PLUGIN_NAME = "MockStudioIntegration";

/**
 * Plugin to provide mocked CoreMedia Studio Integration.
 */
class MockStudioIntegration extends Plugin {
  static readonly pluginName: string = PLUGIN_NAME;

  static readonly requires = [MockContentPlugin, MockServiceAgentPlugin];

  init(): Promise<void> | void {
    const initInformation = reportInitStart(this);

    const contentProvider = this.#initContents();

    const contentDisplayService = new MockContentDisplayService(contentProvider);
    serviceAgent.registerService(contentDisplayService);

    const richtextConfigurationService = new MockRichtextConfigurationService(contentProvider);
    serviceAgent.registerService(richtextConfigurationService);

    const dragDropService = new MockDragDropService();
    serviceAgent.registerService(dragDropService);

    const workAreaService = new MockWorkAreaService(this.editor);
    serviceAgent.registerService(workAreaService);

    const blobDisplayService = new MockBlobDisplayService(contentProvider);
    serviceAgent.registerService(blobDisplayService);

    const clipboardService = new MockClipboardService();
    serviceAgent.registerService<MockClipboardService>(clipboardService, createClipboardServiceDescriptor());

    reportInitEnd(initInformation);
  }

  #initContents(): MockContentProvider {
    const editor = this.editor;
    const contentPlugin = editor.plugins.get(MockContentPlugin);
    return contentPlugin.getContent;
  }
}

export default MockStudioIntegration;
