/* async: Methods require to be asynchronous in production scenario. */
/* eslint-disable @typescript-eslint/require-await */
import RichtextConfigurationService from "@coremedia/ckeditor5-coremedia-studio-integration/content/RichtextConfigurationService";
import { defaultMockContentProvider, MockContentProvider } from "./MockContentPlugin";
import { isUriPath, UriPath } from "@coremedia/ckeditor5-coremedia-studio-integration/content/UriPath";

class MockRichtextConfigurationService implements RichtextConfigurationService {
  readonly #contentProvider: MockContentProvider;

  /**
   * Constructor with some configuration options for the mock service.
   */
  constructor(contentProvider: MockContentProvider = defaultMockContentProvider) {
    this.#contentProvider = contentProvider;
  }

  async hasLinkableType(uriPath: UriPath): Promise<boolean> {
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
