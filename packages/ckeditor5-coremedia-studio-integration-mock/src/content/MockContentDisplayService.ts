import ContentDisplayService from "@coremedia/ckeditor5-coremedia-studio-integration/content/ContentDisplayService";
import { combineLatest, Observable, OperatorFunction } from "rxjs";
import { map } from "rxjs/operators";
import { numericId, UriPath } from "@coremedia/ckeditor5-coremedia-studio-integration/content/UriPath";
import ContentDisplayServiceDescriptor from "@coremedia/ckeditor5-coremedia-studio-integration/content/ContentDisplayServiceDescriptor";
import DisplayHint from "@coremedia/ckeditor5-coremedia-studio-integration/content/DisplayHint";
import ContentAsLink from "@coremedia/ckeditor5-coremedia-studio-integration/content/ContentAsLink";
import { applyDroppable, DroppableConfig } from "./MockRichtextConfigurationService";
import { MockContentProvider } from "./MockContentPlugin";
import MockContent, { asStaticContent } from "./MockContent";
import NamePromise from "./NamePromise";
import { observeEditingHint, observeNameHint, observeTypeHint } from "./DisplayHints";
/**
 * Part of an unreadable content's name (along with its ID).
 */
const CONTENT_NAME_UNREADABLE = "Unreadable";
/**
 * Content name, if name state is truthy (either explicitly
 * or while name toggling mock).
 */
const CONTENT_NAME_TRUTHY = "Lorem";
/**
 * Content name, if name state is falsy (either explicitly
 * or while name toggling mock).
 */
const CONTENT_NAME_FALSY = "Ipsum";

/**
 * Ids, which start with this number, will trigger some evil behavior
 * meant to try challenge escaping et al.
 */
const EVIL_CONTENT_ID_PREFIX = "666";

/**
 * Prefix for contents, which take an extra amount of time to be loaded
 * initially. Note, that the mock-service simulates slow response on
 * content-access on every access to the content, while the content is
 * usually cached in production use.
 *
 * Prefix derived from HTTP Response Code _Request Timeout_.
 */
const SLOW_CONTENT_ID_PREFIX = "408";

/**
 * Evil form (1st) of some content name.
 */
// <iframe src="javascript:alert('Buh!')" width="1px" height="1px">
const EVIL_CONTENT_NAME_TRUTHY = `<iframe src="javascript:alert('Boo 👻')" width="1px" height="1px">`;
/**
 * Evil form (2nd) of some content name.
 * Arabic: Year
 * Chinese: Year
 */
const EVIL_CONTENT_NAME_FALSY = "&lt; عام &amp; 年 &gt;";

/**
 * Different prefixes to provoke a certain behavior.
 */
enum ContentIdPrefix {
  /**
   * Used to provoke _evil_ content names, such as cross-site-scripting attacks.
   */
  evil,
  /**
   * Used to provoke _slow_ content access, i.e., initial access takes longer
   * than for any other content.
   */
  slow,
}
/**
 * Configuration for Mock Service, especially meant for testing purpose.
 */
interface MockServiceConfig {
  /**
   * The maximum first delay for first value to provide.
   * Defaults to 100 ms.
   *
   * For `0` (zero) or less, no timeout will be applied. For not-changing mode
   * this means, that only one state will be reached before `complete` is
   * triggered.
   */
  maxFirstDelayMs?: number;
  /**
   * The (fixed) delay between changes (if a state change got configured).
   * Defaults to 30,000 ms = 30 s.
   *
   * If the change delay is `0` (zero) or less, there will be no delay, but
   * only the truthy state and falsy state will be triggered once. In total,
   * including the initial state, you may expect the following order of states:
   *
   * 1. Falsy State (Initial)
   * 2. Truthy State
   * 3. Falsy State
   * 4. `complete`
   */
  changeDelayMs?: number;
}
/**
 * Default provider will just serve static contents without respecting any
 * configuration.
 */
const defaultMockContentProvider: MockContentProvider = (idOrUriPath: number | UriPath): MockContent => {
  let id: number;
  if (typeof idOrUriPath === "string") {
    id = numericId(idOrUriPath);
  } else {
    id = idOrUriPath;
  }
  return asStaticContent(id);
};

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

/**
 * Represents a toggling state.
 */
const changing$ = Symbol("changing");
type ConfigState = boolean | typeof changing$;

interface CreateContentConfig {
  /**
   * If the name shall change over time.
   */
  name?: ConfigState;
  /**
   * Some prefix to apply for certain behavior like being slow or using
   * evil names to provoke cross-site-scripting attacks (XSS).
   */
  prefix?: ContentIdPrefix;
  /**
   * Shall the content be readable or unreadable. Defaults to readable.
   */
  unreadable?: ConfigState;
  /**
   * Shall the content be checked-in or checked-out. Defaults to checked-out.
   */
  checkedIn?: ConfigState;
  /**
   * Shall the content by a document or a folder. Defaults to document.
   */
  isFolder?: boolean;
}

/**
 * Provides an identifier within the content ID to configure behavior.
 */
const stateToIdentifier = (state: ConfigState | undefined): number => {
  if (state === changing$) {
    return 2;
  }
  return !!state ? 1 : 0;
};
/**
 * Creates a content URI path (such as `content/3332002`) based on the
 * given configuration.
 *
 * @param name - type of name, or changing
 * @param prefix - if a certain prefix shall be used to trigger a specific behavior
 * @param unreadable - state of unreadable, or changing
 * @param checkedIn - state of checked-in, or changing (not relevant for folders)
 * @param isFolder - if the content shall be a folder or a document
 * @param undroppable - if the document (not applicable to folders) shall be droppable
 */
const createContentUriPath = ({
  name,
  prefix,
  unreadable,
  checkedIn,
  isFolder,
  undroppable,
}: CreateContentConfig & DroppableConfig): UriPath => {
  const randomPrefix = (): number => {
    let base = 0;
    switch (prefix) {
      case ContentIdPrefix.slow:
        base = parseInt(`${SLOW_CONTENT_ID_PREFIX}00`);
        break;
      case ContentIdPrefix.evil:
        base = parseInt(`${EVIL_CONTENT_ID_PREFIX}00`);
        break;
    }
    return base + 1 + Math.floor(Math.random() * 99);
  };

  const combine = (...parts: number[]): number => {
    const todoParts = [...parts];
    let result = todoParts.shift() || 0;
    todoParts.forEach((part): void => {
      result = result * 10 + part;
    });
    return result;
  };

  const prefixPart = randomPrefix();
  const namePart = stateToIdentifier(name);
  const unreadablePart = stateToIdentifier(unreadable);
  const checkedInPart = stateToIdentifier(checkedIn);

  const randomTypePart = Math.floor(10 * Math.random());
  const matchedTypePart = !!isFolder === (randomTypePart % 2 === 1);
  const typePart = (randomTypePart + (matchedTypePart ? 0 : 1)) % 10;

  const contentId = applyDroppable(
    combine(prefixPart, namePart, unreadablePart, checkedInPart, typePart),
    !!undroppable
  );
  return `content/${contentId}`;
};

export default MockContentDisplayService;
export {
  CONTENT_NAME_UNREADABLE,
  CONTENT_NAME_TRUTHY,
  CONTENT_NAME_FALSY,
  EVIL_CONTENT_NAME_TRUTHY,
  EVIL_CONTENT_NAME_FALSY,
  changing$,
  ConfigState,
  ContentIdPrefix,
  CreateContentConfig,
  MockServiceConfig,
  createContentUriPath,
};
