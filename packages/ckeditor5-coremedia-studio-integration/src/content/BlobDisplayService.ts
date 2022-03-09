import { ServiceObject } from "@coremedia/service-agent";
import { UriPath } from "./UriPath";
import { Observable } from "rxjs";

/**
 * Represents data for creating an inline representation of the referenced
 * image.
 */
export interface InlinePreview {
  /**
   * Where to read the blob data from.
   */
  thumbnailSrc: string;
  /**
   * A title to apply to the thumbnail representation.
   */
  thumbnailTitle: string;
  /**
   * `false` for normal images. `true` if the `thumbnailSrc` refers
   * to a placeholder image instead. May trigger different rendering.
   */
  isPlaceholder: boolean;
}

/**
 * Service to receive data from blobs like images, audio data, etc.
 */
export default interface BlobDisplayService extends ServiceObject {
  /**
   * Provides information to render a preview of the given blob.
   *
   * For unreadable or not existing content or not existing data, it is
   * expected, that the response contains some kind of visualization for editors
   * about the state (e.g., unreadable — some image, which visualizes that the
   * content is unreadable).
   *
   * @param uriPath - URI path of the content, such as `content/120`
   * @param property - the property, which contains the blob data
   * @returns Observable which resolves to the InlinePreview.
   */
  observe_asInlinePreview(uriPath: UriPath, property: string): Observable<InlinePreview>;
}
