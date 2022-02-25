import BlobDisplayService, {
  InlinePreview,
} from "@coremedia/ckeditor5-coremedia-studio-integration/content/BlobDisplayService";
import { UriPath } from "@coremedia/ckeditor5-coremedia-studio-integration/content/UriPath";
import BlobDisplayServiceDescriptor from "@coremedia/ckeditor5-coremedia-studio-integration/content/BlobDisplayServiceDescriptor";
import { Observable } from "rxjs";

const INLINE_IMG =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mP8z8AARIQB46hC+ioEAGX8E/cKr6qsAAAAAElFTkSuQmCC";

export default class MockBlobDisplayService implements BlobDisplayService {
  observe_asInlinePreview(uriPath: UriPath, property: string): Observable<InlinePreview> {
    return new Observable((subscriber) => {
      setTimeout(() => {
        subscriber.next({ thumbnailSrc: INLINE_IMG, thumbnailTitle: "My inline image", isPlaceholder: false });
      }, 3000);
    });
  }

  getName(): string {
    return new BlobDisplayServiceDescriptor().name;
  }
}
