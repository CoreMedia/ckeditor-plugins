import { ServiceObject } from "@coremedia/service-agent";
import { UriPath } from "./UriPath";
import { Observable } from "rxjs";

export type InlinePreview = { thumbnailSrc: string; thumbnailTitle: string };

interface BlobDisplayService extends ServiceObject {
  /**
   * Provides information to render a preview of the given blob.
   *
   * For unreadable or not existing content or not existing data, it is expected, that the response contains
   * some kind of visualization for authors about the state (e.g. unreadable - some image which visualizes that the content is unreadable).
   *
   * @param uriPath - URI path of the content, such as `content/120`
   * @param property - the property which contains the blob data
   * @returns Observable which resolves to the InlinePreview.
   */
  observe_asInlinePreview(uriPath: UriPath, property: string): Observable<InlinePreview>;
}

export default BlobDisplayService;
