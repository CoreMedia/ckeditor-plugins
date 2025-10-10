import {
  ContentAsLink,
  ContentDisplayService,
  createContentDisplayServiceDescriptor,
  DisplayHint,
  UriPath,
} from "@coremedia/ckeditor5-coremedia-studio-integration";
import { combineLatest, delay, firstValueFrom, Observable, OperatorFunction } from "rxjs";
import { map } from "rxjs/operators";
import { defaultMockContentProvider, MockContentProvider } from "./MockContentPlugin";
import {
  observeEditingHint,
  observeLocaleNameHint,
  observeNameHint,
  observeSiteNameHint,
  observeTypeHint,
} from "./DisplayHints";
import { observeName, observeReadable } from "./MutableProperties";

/**
 * Mock Display Service for use in example app.
 *
 * By default, the service provides just some static content with some
 * predefined settings given a content-ID or the content's URI path.
 *
 * For custom contents, like for example to simulate actively modified
 * contents, simulate slow loading contents, you may register such contents
 * with a given ID at `MockContentPlugin`.
 */
class MockContentDisplayService implements ContentDisplayService {
  readonly #contentProvider: MockContentProvider;

  /**
   * Constructor with some configuration options for the mock service.
   */
  constructor(contentProvider: MockContentProvider = defaultMockContentProvider) {
    this.#contentProvider = contentProvider;
  }

  /**
   * The name of the service.
   */
  getName(): string {
    return createContentDisplayServiceDescriptor().name;
  }

  /**
   * Provides a one-time name, depending on the configuration in URI path.
   * For unreadable contents the promise is rejected.
   */
  async name(uriPath: UriPath): Promise<string> {
    const config = this.#contentProvider(uriPath);
    const observableReadable = observeReadable(config);
    const observableName = observeName(config);

    const [receivedName, receivedReadable] = await firstValueFrom(combineLatest([observableName, observableReadable]));
    if (receivedReadable === undefined) {
      return Promise.reject(new Error(`Failed accessing ${uriPath} (readable state).`));
    }
    if (receivedName === undefined) {
      return Promise.reject(new Error(`Failed accessing ${uriPath} (name).`));
    }
    return receivedName;
  }

  /**
   * Combines the observables for name, type and state into one.
   */
  observe_asLink(uriPath: UriPath, iterations?: number): Observable<ContentAsLink> {
    const mockContent = this.#contentProvider(uriPath);
    const nameSubscription = observeNameHint(mockContent, iterations);
    const typeSubscription = observeTypeHint(mockContent, iterations);
    const stateSubscription = observeEditingHint(mockContent, iterations);
    const siteNameSubscription = observeSiteNameHint(mockContent, iterations);
    const localeNameSubscriptrion = observeLocaleNameHint(mockContent, iterations);

    type Hints = readonly [DisplayHint, DisplayHint, DisplayHint, DisplayHint, DisplayHint];

    const toContentAsLink: OperatorFunction<Hints, ContentAsLink> = map<Hints, ContentAsLink>(
      ([nameHint, siteNameHint, localeNameHint, typeHint, stateHint]: Hints): ContentAsLink => ({
        content: nameHint,
        site: siteNameHint,
        locale: localeNameHint,
        type: typeHint,
        state: stateHint,
      }),
    );

    return combineLatest([
      nameSubscription,
      siteNameSubscription,
      localeNameSubscriptrion,
      typeSubscription,
      stateSubscription,
    ]).pipe(delay(1), toContentAsLink);
  }
}

export default MockContentDisplayService;
