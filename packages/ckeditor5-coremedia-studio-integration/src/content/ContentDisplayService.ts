import type { Observable } from "rxjs";
import type { UriPath } from "./UriPath";
import type ContentAsLink from "./ContentAsLink";

/**
 * Service to provide information how to display a content within CKEditor.
 * It is meant to be used also for drag & drop operations, where the dropped
 * content name shall be written into CKEditor's text area.
 *
 * The service has to be registered globally by `serviceAgent` and may then
 * be retrieved by its descriptor, for example:
 *
 * @example
 * ```typescript
 * serviceAgent
 *   .fetchService(createContentDisplayServiceDescriptor())
 *     .then((service) => {});
 * ```
 */
interface ContentDisplayService {
  /**
   * Provides a name of a content, which must not be observed, but directly
   * used when resolved. Possibly use case: Get the name of a content dropped
   * to CKEditor view, to be written into the text.
   *
   * For unreadable or not existing content, it is expected, that the promise is
   * rejected instead. This may happen on concurrent changes to the content
   * editors started to drag.
   *
   * @param uriPath - URI path of the content, such as `content/120`
   * @returns Promise which resolves to the content's name or is rejected, if the
   * name cannot be resolved.
   */
  name(uriPath: UriPath): Promise<string>;

  /**
   * Observes information of a content, which is required to display it as
   * link in the CKEditor UI. To be used for example in link editing (`FormView`)
   * or link view (`ActionView`).
   *
   * For unreadable contents placeholder information are expected to be
   * returned instead.
   *
   * @param uriPath - URI path of the content, such as `content/120`
   * @returns ContentAsLink object, which provides information required to render
   * a content as Link in the CKEditor UI
   */
  observe_asLink(uriPath: UriPath): Observable<ContentAsLink>;
}

export default ContentDisplayService;
