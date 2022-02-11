import BlobDisplayService from "@coremedia/ckeditor5-coremedia-studio-integration/content/BlobDisplayService";
import { UriPath } from "@coremedia/ckeditor5-coremedia-studio-integration/content/UriPath";
import BlobDisplayServiceDescriptor from "@coremedia/ckeditor5-coremedia-studio-integration/content/BlobDisplayServiceDescriptor";

const INLINE_IMG =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mP8z8AARIQB46hC+ioEAGX8E/cKr6qsAAAAAElFTkSuQmCC";

export default class MockBlobDisplayService implements BlobDisplayService {
  srcAttribute(uriPath: UriPath, property: string): Promise<string> {
    return Promise.resolve(INLINE_IMG);
  }

  getName(): string {
    return new BlobDisplayServiceDescriptor().name;
  }
}
