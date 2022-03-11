import RichtextConfigurationService from "@coremedia/ckeditor5-coremedia-studio-integration/content/RichtextConfigurationService";
import { defaultMockContentProvider, MockContentProvider } from "./MockContentPlugin";
import { isUriPath } from "@coremedia/ckeditor5-coremedia-studio-integration/content/UriPath";

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
  hasLinkableType(uriPath: string): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      if (isUriPath(uriPath)) {
        const mockContent = this.#contentProvider(uriPath);
        return resolve(mockContent.linkable);
      }
      resolve(false);
    });
  }

  isEmbeddableType(uriPath: string): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      if (isUriPath(uriPath)) {
        const mockContent = this.#contentProvider(uriPath);
        return resolve(mockContent.embeddable);
      }
      resolve(false);
    });
  }

  getName(): string {
    return "richtextConfigurationService";
  }
}

export default MockRichtextConfigurationService;
