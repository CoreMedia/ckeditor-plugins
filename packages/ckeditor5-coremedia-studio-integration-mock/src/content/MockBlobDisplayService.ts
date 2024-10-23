import { BlobDisplayService, InlinePreview, UriPath } from "@coremedia/ckeditor5-coremedia-studio-integration";
import { createBlobDisplayServiceDescriptor } from "@coremedia/ckeditor5-coremedia-studio-integration";
import { map } from "rxjs/operators";
import { combineLatest, Observable } from "rxjs";
import { defaultMockContentProvider, MockContentProvider } from "./MockContentPlugin";
import { BlobData, observeBlob, observeName, observeReadable } from "./MutableProperties";
import { PNG_EMPTY_24x24, PNG_LOCK_24x24 } from "./MockFixtures";
import { unreadableName } from "./DisplayHints";

/**
 * Represents an unreadable blob-state.
 */
const unreadableBlob: Pick<BlobData, "value"> = {
  value: PNG_LOCK_24x24
};

/**
 * Represents an unset Blob value.
 */
const unsetBlob: BlobData = {
  value: PNG_EMPTY_24x24,
  mime: "image/png"
};

export default class MockBlobDisplayService implements BlobDisplayService {
  readonly #contentProvider: MockContentProvider;

  /**
   * Constructor with some configuration options for the mock service.
   */
  constructor(contentProvider: MockContentProvider = defaultMockContentProvider) {
    this.#contentProvider = contentProvider;
  }

  observe_asInlinePreview(uriPath: UriPath): Observable<InlinePreview> {
    const mockContent = this.#contentProvider(uriPath);

    const observableBlob = observeBlob(mockContent);
    const observableName = observeName(mockContent);
    const observableReadable = observeReadable(mockContent);
    const unreadableTitle = unreadableName(mockContent);

    return combineLatest([observableBlob, observableName, observableReadable]).pipe(
      map(([blob, name, readable]): InlinePreview => {
        let actualBlob = blob ?? unsetBlob;
        let thumbnailTitle = name;
        let isPlaceholder = !actualBlob.mime.startsWith("image/");

        if (!readable) {
          // Set unreadable placeholder icon.
          actualBlob = {
            ...actualBlob,
            ...unreadableBlob
          };
          thumbnailTitle = unreadableTitle;
          isPlaceholder = true;
        }

        const thumbnailSrc = actualBlob.value;

        return {
          thumbnailSrc,
          thumbnailTitle,
          isPlaceholder
        };
      })
    );
  }

  getName(): string {
    return createBlobDisplayServiceDescriptor().name;
  }
}
