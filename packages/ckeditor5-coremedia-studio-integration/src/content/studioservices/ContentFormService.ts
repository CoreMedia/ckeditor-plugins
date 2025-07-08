/**
 * Service for base Studio work area functionality to be registered with the
 * `serviceAgent`.
 *
 * @see serviceAgent
 */
import { Observable } from "rxjs";

interface ContentFormService {
  /**
   * Opens entity given by their REST URI in Studio tab.
   *
   * @param contentUriPath The content to open the form for, given as a valid Studio Rest content URI.
   *
   * @param options
   * @param options.focus Whether the app that opens the form should be focused / brought into the foreground.
   * @param options.additionalOptions Additional options.
   *
   * @returns A promise that resolves to `true` if the form was opened successfully, or `false` otherwise.
   *
   * * **focus:** whether the app in which this method is called shall be focused. This is 'true' by default.
   *
   * @returns the promise indicating success or failure.
   */
  openContentForm(
    contentUriPath: string,
    options?: {
      /**
       * Whether the app that opens the form should be focused / brought into the foreground.
       */
      focus?: boolean;

      /**
       * Additional but undetermined options that a service implementation might support but is not
       * obliged to (for example, one implementation might support a 'background' option to open
       * the form in the background but other implementations might not).
       */
      additionalOptions?: Record<string, unknown>;
    },
  ): Promise<{ accepted: string[]; rejected: string[] }>;

  /**
   * Determines whether an entity given by their REST URI can be opened in a tab.
   *
   * @param contentUriPath The content to check for, given as a valid Studio Rest content URI.
   *
   * @returns A promise that resolves to `true` if a form for the given content can be opened, or `false` otherwise.
   */
  canBeOpened(contentUriPath: string): Promise<boolean>;

  /**
   * Observes the currently active work area entity.
   *
   * If the entity is a {@link RemoteBean}, its URI path is returned. Otherwise, the
   * whole entity is returned.
   *
   * @returns the observable for the active entity.
   */
  observe_activeContent(): Observable<unknown>;
}

export default ContentFormService;
