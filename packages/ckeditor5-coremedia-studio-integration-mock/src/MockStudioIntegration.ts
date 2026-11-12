import { Plugin } from "ckeditor5";
import { serviceAgent } from "@coremedia/service-agent";
import { reportInitEnd, reportInitStart } from "@coremedia/ckeditor5-core-common";
import {
  createClipboardServiceDescriptor,
  createContentImportServiceDescriptor,
  createContentReferenceServiceDescriptor,
} from "@coremedia/ckeditor5-coremedia-studio-integration";
import MockContentDisplayService from "./content/MockContentDisplayService";
import MockRichtextConfigurationService from "./content/MockRichtextConfigurationService";
import MockDragDropService from "./content/MockDragDropService";
import MockContentFormService from "./content/MockContentFormService";
import { MockCollectionViewLinkService } from "./content/MockCollectionViewLinkService";
import type { MockContentProvider } from "./content/MockContentPlugin";
import MockContentPlugin from "./content/MockContentPlugin";
import MockBlobDisplayService from "./content/MockBlobDisplayService";
import MockServiceAgentPlugin from "./content/MockServiceAgentPlugin";
import MockClipboardService from "./content/MockClipboardService";
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
    const collectionViewService = new MockCollectionViewLinkService(this.editor);
    serviceAgent.registerService(collectionViewService);
    const richtextConfigurationService = new MockRichtextConfigurationService(this.editor, contentProvider);
    serviceAgent.registerService(richtextConfigurationService);
    const dragDropService = new MockDragDropService();
    serviceAgent.registerService(dragDropService);
    const contentFormService = new MockContentFormService(this.editor);
    serviceAgent.registerService(contentFormService);
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
