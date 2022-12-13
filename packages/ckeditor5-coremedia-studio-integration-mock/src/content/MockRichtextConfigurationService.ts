/* async: Methods require to be asynchronous in production scenario. */
/* eslint-disable @typescript-eslint/require-await */
import RichtextConfigurationService from "@coremedia/ckeditor5-coremedia-studio-integration/content/RichtextConfigurationService";
import { defaultMockContentProvider, MockContentProvider } from "./MockContentPlugin";
import { isUriPath, UriPath } from "@coremedia/ckeditor5-coremedia-studio-integration/content/UriPath";
import { serviceAgent } from "@coremedia/service-agent";
import { createContentReferenceServiceDescriptor } from "@coremedia/ckeditor5-coremedia-studio-integration/content/studioservices/IContentReferenceService";
import { Editor } from "@ckeditor/ckeditor5-core";
import MockExternalContentPlugin from "./MockExternalContentPlugin";

class MockRichtextConfigurationService implements RichtextConfigurationService {
  readonly #contentProvider: MockContentProvider;
  readonly #editor: Editor;

  /**
   * Constructor with some configuration options for the mock service.
   */
  constructor(editor: Editor, contentProvider: MockContentProvider = defaultMockContentProvider) {
    this.#contentProvider = contentProvider;
    this.#editor = editor;
  }

  async hasLinkableType(uriPath: UriPath): Promise<boolean> {
    const contentReferenceService = serviceAgent.getService(createContentReferenceServiceDescriptor());
    if (!contentReferenceService) {
      return Promise.reject("ContentReferenceService unavailable");
    }

    const contentReference = await contentReferenceService.getContentReference(uriPath);
    if (contentReference.contentUri) {
      return this.#contentProvider(contentReference.contentUri).linkable;
    }
    if (contentReference.externalUriInformation) {
      const mockExternalContentPlugin = this.#editor.plugins.get(MockExternalContentPlugin);
      const externalContent = mockExternalContentPlugin.getExternalContent(uriPath);
      if (externalContent) {
        return externalContent.contentAfterImport.linkable;
      }
    }
    if (isUriPath(uriPath)) {
      const mockContent = this.#contentProvider(uriPath);
      return mockContent.linkable;
    }
    return false;
  }

  async isEmbeddableType(uriPath: UriPath): Promise<boolean> {
    if (isUriPath(uriPath)) {
      const mockContent = this.#contentProvider(uriPath);
      return mockContent.embeddable;
    }
    return false;
  }

  async resolveBlobPropertyReference(uriPath: UriPath): Promise<string> {
    if (isUriPath(uriPath)) {
      const mockContent = this.#contentProvider(uriPath);
      if (!mockContent.embeddable) {
        // The "should not happen" code.
        throw new Error(`Content '${uriPath}' is not embeddable.`);
      }
      // The actual property does not matter in this mock scenario.
      return `${uriPath}#properties.data`;
    }
    throw new Error(`'${uriPath}' is not a valid URI-path.`);
  }

  getName(): string {
    return "richtextConfigurationService";
  }
}

export default MockRichtextConfigurationService;
