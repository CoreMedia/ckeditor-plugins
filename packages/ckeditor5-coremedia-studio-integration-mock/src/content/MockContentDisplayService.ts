import ContentDisplayService from "@coremedia/ckeditor5-coremedia-studio-integration/content/ContentDisplayService";
import { combineLatest, Observable, OperatorFunction, Subscription } from "rxjs";
import { first, map } from "rxjs/operators";
import { contentUriPath, UriPath } from "@coremedia/ckeditor5-coremedia-studio-integration/content/UriPath";
import ContentDisplayServiceDescriptor from "@coremedia/ckeditor5-coremedia-studio-integration/content/ContentDisplayServiceDescriptor";
import DisplayHint from "@coremedia/ckeditor5-coremedia-studio-integration/content/DisplayHint";
import ContentAsLink from "@coremedia/ckeditor5-coremedia-studio-integration/content/ContentAsLink";
import { defaultMockContentProvider, MockContentProvider } from "./MockContentPlugin";
import { observeEditingHint, observeNameHint, observeTypeHint } from "./DisplayHints";
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
    return new ContentDisplayServiceDescriptor().name;
  }

  /**
   * Provides a one-time name, depending on the configuration in URI path.
   * For unreadable contents the promise is rejected.
   */
  name(uriPath: UriPath): Promise<string> {
    const config = this.#contentProvider(uriPath);
    return new Promise<string>((resolve, reject) => {
      const { id } = config;
      const uriPath = contentUriPath(id);
      const observableReadable = observeReadable(config);
      const observableName = observeName(config);

      const combinedObservable = combineLatest([observableName, observableReadable]).pipe(first());

      let subscription: Subscription | undefined;

      subscription = combinedObservable.subscribe(([receivedName, receivedReadable]): void => {
        // We only want to receive one update. Unsure, if necessary — but it does no harm.
        subscription?.unsubscribe();
        subscription = undefined;
        if (receivedReadable === undefined) {
          return reject(`Failed accessing ${uriPath} (readable state).`);
        }
        if (receivedName === undefined) {
          return reject(`Failed accessing ${uriPath} (name).`);
        }
        // By intention also delays rejection, as the result for unreadable
        // may take some time.
        if (!receivedReadable) {
          return reject(`Content ${uriPath} is unreadable.`);
        }
        resolve(receivedName);
      });
    });
  }

  /**
   * Combines the observables for name, type and state into one.
   */
  observe_asLink(uriPath: UriPath): Observable<ContentAsLink> {
    const mockContent = this.#contentProvider(uriPath);
    const nameSubscription = observeNameHint(mockContent);
    const typeSubscription = observeTypeHint(mockContent);
    const stateSubscription = observeEditingHint(mockContent);

    type Hints = readonly [DisplayHint, DisplayHint, DisplayHint];

    const toContentAsLink: OperatorFunction<Hints, ContentAsLink> = map<Hints, ContentAsLink>(
      ([n, t, s]: Hints): ContentAsLink => {
        const content = {
          content: {
            name: n.name,
            classes: n.classes,
          },
        };
        const type = {
          type: {
            name: t.name,
            classes: t.classes,
          },
        };
        const state = {
          state: {
            name: s.name,
            classes: s.classes,
          },
        };
        return {
          ...content,
          ...type,
          ...state,
        };
      }
    );

    return combineLatest([nameSubscription, typeSubscription, stateSubscription]).pipe(toContentAsLink);
  }
}

export default MockContentDisplayService;
