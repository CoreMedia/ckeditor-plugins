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

  /**
   * A content id is linkable if
   *
   * * it is not a folder (even number)
   *
   * * it is the last digit, and it is not dividable by 4.
   *
   *     This represents any content, which is not linkable.
   *
   * @param uriPath - an uripath in the format 'content/content-id'
   */
  async hasLinkableType(uriPath: UriPath): Promise<boolean> {
    if (isUriPath(uriPath)) {
      const mockContent = this.#contentProvider(uriPath);
      return mockContent.linkable;
    }
    return false;
  }

  isEmbeddableType(uriPath: UriPath): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      if (isUriPath(uriPath)) {
        const mockContent = this.#contentProvider(uriPath);
        return resolve(mockContent.embeddable);
      }
      resolve(false);
    });
  }

  resolveBlobPropertyReference(uriPath: UriPath): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      if (isUriPath(uriPath)) {
        const mockContent = this.#contentProvider(uriPath);
        if (!mockContent.embeddable) {
          // The "should not happen" code.
          return reject(new Error(`Content '${uriPath}' is not embeddable.`));
        }
        // The actual property does not matter in this mock scenario.
        return resolve(`${uriPath}#properties.data`);
      }
      reject(new Error(`'${uriPath}' is not a valid URI-path.`));
    });
  }

  getName(): string {
    return "richtextConfigurationService";
  }
}

export default MockRichtextConfigurationService;
