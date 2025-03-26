import { Plugin } from "ckeditor5";
import MockContentDisplayService from "./content/MockContentDisplayService";
import MockRichtextConfigurationService from "./content/MockRichtextConfigurationService";
import { serviceAgent } from "@coremedia/service-agent";
import MockDragDropService from "./content/MockDragDropService";
import MockWorkAreaService from "./content/MockWorkAreaService";
import MockContentPlugin, { MockContentProvider } from "./content/MockContentPlugin";
import MockBlobDisplayService from "./content/MockBlobDisplayService";
import MockServiceAgentPlugin from "./content/MockServiceAgentPlugin";
import { reportInitEnd, reportInitStart } from "@coremedia/ckeditor5-core-common";
import MockClipboardService from "./content/MockClipboardService";
import {
  createClipboardServiceDescriptor,
  createContentReferenceServiceDescriptor,
  createContentImportServiceDescriptor,
} from "@coremedia/ckeditor5-coremedia-studio-integration";
import { MockContentReferenceService } from "./content/MockContentReferenceService";
import MockExternalContentPlugin from "./content/MockExternalContentPlugin";
import { MockContentImportService } from "./content/MockContentImportService";
import { MockBlocklistService } from "./MockBlocklistService";
import { MockContentSearchService } from "./content/MockContentSearchService";

const PLUGIN_NAME = "MockStudioIntegration";

/**
 * Plugin to provide mocked CoreMedia Studio Integration.
 */
export class MockStudioIntegration extends Plugin {
  static readonly pluginName: string = PLUGIN_NAME;
  static readonly requires = [
    MockBlocklistService,
    MockContentPlugin,
    MockExternalContentPlugin,
    MockServiceAgentPlugin,
  ];

  init(): Promise<void> | void {
    const initInformation = reportInitStart(this);
    const contentProvider = this.#initContents();
    const contentDisplayService = new MockContentDisplayService(contentProvider);
    serviceAgent.registerService(contentDisplayService);
    const contentSearchService = new MockContentSearchService(contentProvider);
    serviceAgent.registerService(contentSearchService);
    const richtextConfigurationService = new MockRichtextConfigurationService(this.editor, contentProvider);
    serviceAgent.registerService(richtextConfigurationService);
    const dragDropService = new MockDragDropService();
    serviceAgent.registerService(dragDropService);
    const workAreaService = new MockWorkAreaService(this.editor);
    serviceAgent.registerService(workAreaService);
    const blobDisplayService = new MockBlobDisplayService(contentProvider);
    serviceAgent.registerService(blobDisplayService);
    const clipboardService = new MockClipboardService();
    serviceAgent.registerService<MockClipboardService>(clipboardService, createClipboardServiceDescriptor());
    const contentReferenceService = new MockContentReferenceService(this.editor);
    serviceAgent.registerService<MockContentReferenceService>(
      contentReferenceService,
      createContentReferenceServiceDescriptor(),
    );
    const contentImportService = new MockContentImportService(this.editor);
    serviceAgent.registerService<MockContentImportService>(
      contentImportService,
      createContentImportServiceDescriptor(),
    );
    reportInitEnd(initInformation);
  }

  #initContents(): MockContentProvider {
    const editor = this.editor;
    const contentPlugin = editor.plugins.get(MockContentPlugin);
    return contentPlugin.getContent;
  }
}
