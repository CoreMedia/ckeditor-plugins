import ContentDisplayService from "@coremedia/ckeditor5-coremedia-studio-integration/content/ContentDisplayService";
import { combineLatest, Observable, OperatorFunction } from "rxjs";
import { map } from "rxjs/operators";
import { UriPath } from "@coremedia/ckeditor5-coremedia-studio-integration/content/UriPath";
import ContentDisplayServiceDescriptor from "@coremedia/ckeditor5-coremedia-studio-integration/content/ContentDisplayServiceDescriptor";
import DisplayHint from "@coremedia/ckeditor5-coremedia-studio-integration/content/DisplayHint";
import ContentAsLink from "@coremedia/ckeditor5-coremedia-studio-integration/content/ContentAsLink";
import { defaultMockContentProvider, MockContentProvider } from "./MockContentPlugin";
import NamePromise from "./NamePromise";
import { observeEditingHint, observeNameHint, observeTypeHint } from "./DisplayHints";

/**
 * Mock Display Service for use in example app. The display of contents
 * is controlled by their ID, which has some magic parts. The content ID
 * (represented as URI path) is expected to be as follows:
 *
 * ```
 * content/
 *   <some numbers>
 *   <name: 0|1|2>
 *   <unreadable: 0|1|2>
 *   <checkedIn: 0|1|2>
 *   <folderType: 0-9>
 * ```
 *
 * **prefix:** _some numbers_ is any set of numbers as prefix (maybe empty).
 * If you set `666` as start of the prefix, it will trigger some evil behavior,
 * which is meant to test cross-site-scripting attacks.
 *
 * **checkedIn:** 0 = checked out, 1 = checked in, 2 = changing
 *
 * **name:** 0 = some name, 1 = some other name, 2 = changing name
 *
 * **unreadable:** 0 = readable, 1 = unreadable, 2 = changing
 *
 * **checkedIn:** 0 = checked out, 1 = checked in, 2 = changing
 *
 * **folderType:** even number = document, odd number = folder
 *
 * If any of these is unmatched, the default state will be chosen, which is:
 * checked out, some name, readable, document.
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
    return new NamePromise(this.#contentProvider(uriPath));
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
