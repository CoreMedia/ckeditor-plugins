import ContentDisplayService from "@coremedia/coremedia-studio-integration/src/content/ContentDisplayService";
import { combineLatest, Observable, OperatorFunction, Subscriber, TeardownLogic } from "rxjs";
import { map } from "rxjs/operators";
import { numericId, UriPath } from "@coremedia/coremedia-studio-integration/content/UriPath";
import ContentDisplayServiceDescriptor
  from "@coremedia/coremedia-studio-integration/content/ContentDisplayServiceDescriptor";
import DisplayHint from "@coremedia/coremedia-studio-integration/content/DisplayHint";
import ContentAsLink from "@coremedia/coremedia-studio-integration/content/ContentAsLink";

/**
 * By default delay the appearance of data in the UI a little bit.
 */
const MAX_FIRST_DELAY_MS = 100;
/**
 * If states shall change, it will be done with this fixed
 * interval (in milliseconds).
 */
const CHANGE_DELAY_MS = 30000;

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
 * Ids which start with this number, will trigger some evil behavior
 * meant to try challenge escaping et al.
 */
const EVIL_CONTENT_ID_PREFIX = "666";
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
 * Calculate the first delay; adds some randomness.
 */
const firstDelayMs = (maxFirstDelayMs: number): number => {
  return Math.random() * maxFirstDelayMs;
};

/**
 * Create the initial display.
 *
 * @param subscriber subscriber to inform
 * @param toggling {@code true} to signal toggling mode, {@code false} for not toggling,
 * i.e. on first value reached, `complete` will be triggered.
 * @param maxFirstDelayMs delay for first display
 * @param initial initial display
 */
const initDisplay = (
  subscriber: Subscriber<DisplayHint>,
  toggling: boolean,
  { maxFirstDelayMs }: MockServiceConfig,
  initial: DisplayHint
): void => {
  const delayMs: number = maxFirstDelayMs === undefined ? MAX_FIRST_DELAY_MS : maxFirstDelayMs;
  if (delayMs < 1) {
    // Immediate trigger.
    subscriber.next(initial);
    if (!toggling) {
      subscriber.complete();
    }
  } else {
    setTimeout(() => {
      subscriber.next(initial);
      if (!toggling) {
        subscriber.complete();
      }
    }, firstDelayMs(delayMs));
  }
};

/**
 * Sets up toggling behavior of display state.
 * @param subscriber subscriber to inform on changes
 * @param changeDelayMs the change delay in milliseconds
 * @param firstState first state to enter
 * @param otherStates other states to follow
 * @return TeardownLogic function to stop the timer on unsubscribe
 */
const initToggle = (
  subscriber: Subscriber<DisplayHint>,
  { changeDelayMs }: MockServiceConfig,
  firstState: DisplayHint,
  ...otherStates: DisplayHint[]
): TeardownLogic => {
  const states = [firstState, ...otherStates];
  const maxState = states.length;
  const delayMs: number = changeDelayMs === undefined ? CHANGE_DELAY_MS : changeDelayMs;

  if (delayMs < 1) {
    states.forEach((s) => subscriber.next(s));
    subscriber.complete();
  }

  let currentState = 0;

  const timerId = setInterval(() => {
    subscriber.next(states[currentState]);
    currentState = (currentState + 1) % maxState;
  }, changeDelayMs || CHANGE_DELAY_MS);
  // Unsubscribe function
  return () => {
    clearInterval(timerId);
  };
};

/**
 * Creates an observable for the given mode.
 *
 * @param mode mode to respect.
 * @param truthyState state if mode is {@code true}; first state while toggling
 * @param falsyState state if mode is {@code false}; second state while toggling
 * @param config configuration for observable behavior
 */
const createObservable = (
  mode: ConfigState | undefined,
  truthyState: DisplayHint,
  falsyState: DisplayHint,
  config: MockServiceConfig
): Observable<DisplayHint> => {
  return new Observable<DisplayHint>((subscriber) => {
    if (!mode) {
      return initDisplay(subscriber, false, config, falsyState);
    }
    if (mode === true) {
      return initDisplay(subscriber, false, config, truthyState);
    }
    // Mode is changing
    initDisplay(subscriber, true, config, falsyState);
    return initToggle(subscriber, config, truthyState, falsyState);
  });
};

/**
 * Mock Display Service for use in example app. The display of contents
 * is controlled by their ID which has some magic parts. The content ID
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
 * **prefix:** _some numbers_ is any set of numbers as prefix (may be empty).
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
  readonly #config: MockServiceConfig;

  /**
   * Constructor with some configuration options for the mock service.
   *
   * @param config
   */
  constructor(config?: MockServiceConfig) {
    this.#config = !config ? {} : { ...config };
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
    const config = parseContentConfig(uriPath);
    const unreadable = !!config.unreadable;
    const truthyName = config.evil ? EVIL_CONTENT_NAME_TRUTHY : CONTENT_NAME_TRUTHY;
    const falsyName = config.evil ? EVIL_CONTENT_NAME_FALSY : CONTENT_NAME_FALSY;

    if (unreadable) {
      return Promise.reject(`Content ${uriPath} is unreadable.`);
    }
    return Promise.resolve(!config.name ? falsyName : truthyName);
  }

  /**
   * Combines the observables for name, type and state into one.
   * @param uriPath
   */
  observe_asLink(uriPath: UriPath): Observable<ContentAsLink> {
    const nameSubscription = this.observe_name(uriPath);
    const typeSubscription = this.observe_type(uriPath);
    const stateSubscription = this.observe_state(uriPath);
    const toContentAsLink: OperatorFunction<readonly [DisplayHint, DisplayHint, DisplayHint], ContentAsLink> =
      map<readonly [DisplayHint, DisplayHint, DisplayHint], ContentAsLink>(([n, t, s]: readonly [DisplayHint, DisplayHint, DisplayHint]): ContentAsLink => {
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
      });
    return combineLatest([nameSubscription, typeSubscription, stateSubscription]).pipe(toContentAsLink);
  }

  /**
   * Provides a name which is either static (one of two) or changing over time
   * (between two names). For unreadable contents, an unreadable placeholder
   * is returned. For unreadable-toggle behavior, it toggled between unreadable
   * and one of the two names. This overrides name-toggle behavior.
   *
   * @param uriPath URI path to create mock for
   */
  observe_name(uriPath: UriPath): Observable<DisplayHint> {
    const config = parseContentConfig(uriPath);
    const id = numericId(uriPath);
    const typeName = config.isFolder ? "Folder" : "Document";
    const unreadableState: DisplayHint = {
      name: `${CONTENT_NAME_UNREADABLE} ${typeName} #${id}`,
      classes: [],
    };
    const truthyName = config.evil ? EVIL_CONTENT_NAME_TRUTHY : CONTENT_NAME_TRUTHY;
    const falsyName = config.evil ? EVIL_CONTENT_NAME_FALSY : CONTENT_NAME_FALSY;

    const truthyState: DisplayHint = {
      name: `${truthyName} ${typeName} #${id}`,
      classes: ["content--1"],
    };
    const falsyState: DisplayHint = {
      name: `${falsyName} ${typeName} #${id}`,
      classes: ["content--0"],
    };

    // true or changing
    if (!!config.unreadable) {
      return createObservable(
        config.unreadable,
        unreadableState,
        !!config.name ? truthyState : falsyState,
        this.#config
      );
    }

    return createObservable(config.name, truthyState, falsyState, this.#config);
  }

  /**
   * Provides a hint for content state (checked-in, checked-out, published, ...)
   * but only for checked-in and checked-out. In case of toggle-behavior the
   * state changes from checked-out to checked-in back and forth.
   *
   * In case of unreadable content, a possibly configured toggle-behavior for
   * unreadable overrides toggle-behavior for state.
   *
   * @param uriPath URI path to create mock state for
   */
  observe_state(uriPath: UriPath): Observable<DisplayHint> {
    const config = parseContentConfig(uriPath);
    const checkedInState: DisplayHint = {
      name: "Checked In",
      classes: ["icon--checked-in"],
    };
    const checkedOutState: DisplayHint = {
      name: "Checked Out",
      classes: ["icon--checked-out"],
    };
    const unreadableState: DisplayHint = {
      name: "",
      classes: [],
    };
    let state = config.checkedIn;

    if (config.isFolder) {
      // force checked-in state: Folders cannot be checked-out.
      state = true;
    }

    if (!!config.unreadable) {
      const falsyState = !!state ? checkedInState : checkedOutState;
      return createObservable(config.unreadable, unreadableState, falsyState, this.#config);
    }

    return createObservable(state, checkedInState, checkedOutState, this.#config);
  }

  /**
   * Provides a hint for the content type. In this basic mock, only folder type
   * and document type are distinguished. Toggle behavior is only available for
   * unreadable flag.
   *
   * @param uriPath URI path to create mock type for
   */
  observe_type(uriPath: UriPath): Observable<DisplayHint> {
    const config = parseContentConfig(uriPath);
    const folderState: DisplayHint = {
      name: "Folder",
      classes: ["icon--folder"],
    };
    const documentState: DisplayHint = {
      name: "Document",
      classes: ["icon--document"],
    };
    const unreadableState: DisplayHint = {
      name: "Unreadable",
      classes: ["icon--lock"],
    };
    if (!!config.unreadable) {
      const falsyState = !!config.isFolder ? folderState : documentState;
      return createObservable(config.unreadable, unreadableState, falsyState, this.#config);
    }
    return createObservable(config.isFolder, folderState, documentState, this.#config);
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
   * If some evil states should be simulated or not. This applies especially
   * to cross-site-scripting attacks (XSS).
   */
  evil?: boolean;
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
 *
 * @param state
 */
const stateToIdentifier = (state: ConfigState | undefined): number => {
  if (state === changing$) {
    return 2;
  }
  return !!state ? 1 : 0;
};

const identifierToState = (identifier: number) => {
  switch (identifier) {
    case 2:
      return changing$;
    case 1:
      return true;
    case 0:
    default:
      return false;
  }
};

/**
 * Parses the "configuration" as provided by ID. For details, see documentation
 * of {@link MockContentDisplayService}.
 *
 * In general, the (especially) trailing numbers trigger a specific behavior.
 *
 * Examples:
 *
 * ```
 * content/90000 - first name, readable, checked-out and a document
 * content/91000 - second name, readable, checked-out and a document
 * content/92000 - toggling name, readable, checked-out and a document
 *
 * content/90100 - first name, unreadable, checked-out and a document
 * content/90010 - first name, unreadable, checked-in and a document
 * ```
 *
 * There is also an evil mode, triggered by a prefix `666` in the numeric ID.
 * This is especially dedicated to cross-site-scripting attacks. Thus,
 * `content/666000` will provide some name containing HTML which is trying to
 * escape "the box" and do harm to the editors.
 *
 * For any unmatched uriPath, a default behavior is assumed. Thus, you any
 * numeric ID will trigger some state.
 *
 * @param uriPath URI path which by magic contains some configuration
 */
const parseContentConfig = (uriPath: UriPath): CreateContentConfig => {
  const configPattern =
    /^content\/(?<prefix>\d+)(?<namechange>[0-2])(?<unreadable>[0-2])(?<checkedin>[0-2])(?<isfolder>[0-9])$/;
  const match = configPattern.exec(uriPath);

  if (!match) {
    const uriPathPattern = /^content\/(?<id>\d+)$/;
    const uriPathMatch = uriPathPattern.exec(uriPath);
    if (!uriPathMatch) {
      throw new Error("Invalid URI path.");
    }
    const numericIdPart = uriPathMatch[1];
    const numericId = parseInt(numericIdPart);
    const isFolder = uriPathMatch && numericId % 2 === 1;
    // (Nearly) all defaults
    return {
      evil: numericIdPart.startsWith(EVIL_CONTENT_ID_PREFIX),
      isFolder: isFolder,
    };
  }
  return {
    name: identifierToState(parseInt(match[2])),
    evil: match[1].startsWith("666"),
    unreadable: identifierToState(parseInt(match[3])),
    checkedIn: identifierToState(parseInt(match[4])),
    // in contrast to other flags, we simulate the default CMS here, which is,
    // that even numbers are for documents, while odd numbers are for folders.
    isFolder: parseInt(match[5]) % 2 === 1,
  };
};

// TODO[cke] If unused, remove; otherwise, add unit tests
const createContentUriPath = ({ name, evil, unreadable, checkedIn, isFolder }: CreateContentConfig): UriPath => {
  function randomPrefix(): number {
    const base = evil ? 66600 : 0;
    return base + Math.floor(Math.random() * 99);
  }

  return `content/${randomPrefix()}${stateToIdentifier(name)}${stateToIdentifier(unreadable)}${stateToIdentifier(
    checkedIn
  )}${stateToIdentifier(isFolder)}`;
};

export default MockContentDisplayService;
export {
  CONTENT_NAME_UNREADABLE,
  CONTENT_NAME_TRUTHY,
  CONTENT_NAME_FALSY,
  EVIL_CONTENT_NAME_TRUTHY,
  EVIL_CONTENT_NAME_FALSY,
  createContentUriPath,
};
