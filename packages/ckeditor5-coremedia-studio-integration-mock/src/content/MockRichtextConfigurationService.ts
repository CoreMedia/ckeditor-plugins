import RichtextConfigurationService from "@coremedia/ckeditor5-coremedia-studio-integration/content/RichtextConfigurationService";
import { defaultMockContentProvider, MockContentProvider } from "./MockContentPlugin";

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
      if (!uriPath.startsWith("content/")) {
        resolve(false);
        return;
      }

      const mockContent = this.#contentProvider(uriPath);
      resolve(mockContent.linkable);
    });
  }

  isEmbeddableType(uriPath: string): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      if (!uriPath.startsWith("content")) {
        resolve(false);
        return;
      }

      const mockContent = this.#contentProvider(uriPath);
      resolve(mockContent.embeddable);
    });
  }

  getName(): string {
    return "richtextConfigurationService";
  }
}

export default MockRichtextConfigurationService;
