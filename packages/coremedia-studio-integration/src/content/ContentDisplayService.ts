/**
 * Service for retrieving display hints for CoreMedia Content Objects
 * within CKEditor.
 */
import { UriPath } from "./UriPath";
import { Observable } from "rxjs";
import { ServiceObject } from "@coremedia/studio-apps-service-agent";

interface ContentDisplayService extends ServiceObject {
  /**
   * Retrieve the display hint for the content itself. This typically contains
   * the content name and possibly some CSS to apply depending on the content
   * type or state.
   *
   * This must be observed, as the content name may be changed concurrently,
   * as well as the state may change, which may trigger an update to the CSS
   * style classes.
   *
   * For unreadable contents it must be ensured, that no sensitive data are
   * compromised, which for example means not to expose the content name, but
   * provide a localized placeholder instead.
   *
   * @param uriPath URI path of the content, such as `content/120`
   */
  getDisplayHint(uriPath: UriPath): Observable<DisplayHint>;

  /**
   * Retrieve a display hint for the content type. This typically contains
   * the localized name of the content-type and a CSS style class to apply
   * for displaying a corresponding icon in the UI.
   *
   * This must be observed. Although the type of a content will not change,
   * it may change its readability state, for example when moved to a different
   * folder. In these cases the UI must not compromise any sensitive data.
   * A content-type may be such sensitive data, which must be hidden (think
   * of content-types such as _Contract_ or _Dismissal_).
   *
   * For unreadable contents it is expected that the type name changes to
   * some localized placeholder text, just as the icon, chosen by CSS
   * style classes, may change to a lock symbol for example.
   *
   * @param uriPath URI path of the content, such as `content/120`
   */
  getTypeDisplayHint(uriPath: UriPath): Observable<DisplayHint>;

  /**
   * Retrieve a display hint for the content state. This is typically a
   * checked-out state, published state, where one of those states takes
   * precedence for display in the UI.
   *
   * This must be observed, as the state of a content may change concurrently.
   *
   * @param uriPath URI path of the content, such as `content/120`
   */
  getStateDisplayHint(uriPath: UriPath): Observable<DisplayHint>;
}

/**
 * A general display hint for an element to represent in the CKEditor UI.
 *
 * Many hints may change its state concurrently, such as a content's name
 * or state. Thus, `DisplayHints` should be observed for changes.
 *
 * A display hint may also refer to some unreadable content. Just as before,
 * this state may change, if contents are moved. In this case it is important
 * not to expose any compromising details of a content in the UI. For the
 * content's name you will typically want to provide a localized placeholder
 * text instead. For the content's state you most likely want to even hide
 * the state. The content type hint is expected to transparently change
 * to an _unreadable_ hint, which is that for example a lock symbol is shown
 * instead of a content-type icon.
 */
interface DisplayHint {
  /**
   * The name of the entity to display.
   *
   * This may be the name of a content (which will be directly visible in UI)
   * or the localized name of a state or content-type. For any other information
   * than the content name, it is expected, that these names are for example
   * used for ARIA support.
   *
   * Ensure not to compromise sensitive data for unreadable contents here.
   *
   * The returned string will be correctly encoded within the CKEditor UI.
   */
  readonly name: string;
  /**
   * Style classes to apply to displayed entity.
   *
   * Such style classes may for example colorize a displayed content based
   * on its type (or state, like unreadable) or it may trigger icons to displayed
   * in the UI, for example the icon of a given content type.
   */
  readonly classes?: string[];
}

export default ContentDisplayService;
export { DisplayHint };
