import { ServiceObject } from "@coremedia/service-agent";
import { UriPath } from "./UriPath";
import { Observable } from "rxjs";

interface BlobDisplayService extends ServiceObject {
  /**
   * Provides the src attribute for a blob of a content, which must not be observed, but directly
   * used when resolved.
   *
   * For unreadable or not existing content or not existing data, it is expected, that the promise is
   * rejected instead.
   *
   * @param uriPath - URI path of the content, such as `content/120`
   * @param property - the property which contains the blob data
   * @returns Promise which resolves to the src attribute data or is rejected, if it can't be resolved.
   */
  observe_srcAttribute(uriPath: UriPath, property: string): Observable<string>;
}

export default BlobDisplayService;
