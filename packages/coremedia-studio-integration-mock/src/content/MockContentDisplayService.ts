import ContentDisplayService from "@coremedia/coremedia-studio-integration/content/ContentDisplayService";
import { combineLatest, Observable, OperatorFunction, Subscriber, TeardownLogic } from "rxjs";
import { map } from "rxjs/operators";
import { numericId, UriPath } from "@coremedia/coremedia-studio-integration/content/UriPath";
import ContentDisplayServiceDescriptor
  from "@coremedia/coremedia-studio-integration/content/ContentDisplayServiceDescriptor";
import DisplayHint from "@coremedia/coremedia-studio-integration/content/DisplayHint";
import ContentAsLink from "@coremedia/coremedia-studio-integration/content/ContentAsLink";
import { applyDroppable, DroppableConfig } from "./MockRichtextConfigurationService";

/**
 * By default delay the appearance of data in the UI a little bit.
 */
const MAX_FIRST_DELAY_MS = 100;
/**
 * First initial delay for contents, that take long to load.
 */
const SLOW_FIRST_DELAY_MS = 10000;
/**
 * If states shall change, it will be done with this fixed
 * interval (in milliseconds).
 */
const CHANGE_DELAY_MS = 10000;

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
 * Root folder is the only one, which always only has an empty name.
 */
const ROOT_DISPLAY_HINT: DisplayHint = {
  name: "",
  classes: [],
};

/**
 * Different prefixes to provoke a certain behavior.
 */
enum ContentIdPrefix {
  /**
   * Used to provoke _evil_ content names, such as cross-site-scripting attacks.
   */
  evil,
  /**
   * Used to provoke _slow_ content access, i.e. initial access takes longer
   * than for any other content.
   */
  slow,
}

/**
 * Parses a given prefix. If the prefix has no special meaning, `undefined`
 * is returned.
 *
 * @param numericId numeric ID (as string) to analyze
 */
const parsePrefix = (numericId: string): ContentIdPrefix | undefined => {
  // This may be solved more elegant with mapped enum values. But this should
  // do it for now.
  if (numericId.startsWith(EVIL_CONTENT_ID_PREFIX)) {
    return ContentIdPrefix.evil;
  }
  if (numericId.startsWith(SLOW_CONTENT_ID_PREFIX)) {
    return ContentIdPrefix.slow;
  }
  return undefined;
};

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
const firstDelayMs = (slow: boolean, maxFirstDelayMs: number): number => {
  if (slow) {
    // We don't want a random part, to ensure, it is really slow.
    return SLOW_FIRST_DELAY_MS;
  }
  return Math.random() * maxFirstDelayMs;
};

/**
 * Create the initial display.
 *
 * @param subscriber subscriber to inform
 * @param toggling {@code true} to signal toggling mode, {@code false} for not toggling,
 * i.e. on first value reached, `complete` will be triggered.
 * @param maxFirstDelayMs delay for first display
 * @param slow if the initially provided value should take some extra amount of time
 * @param initial initial display
 */
const initDisplay = (
  subscriber: Subscriber<DisplayHint>,
  toggling: boolean,
  { maxFirstDelayMs }: MockServiceConfig,
  slow: boolean,
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
    }, firstDelayMs(slow, delayMs));
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

  let currentState = 0;

  if (delayMs < 1) {
    /*
     * Still using some timeout, as combined observables can hardly be tested
     * otherwise. Nevertheless, we stop after we have replayed all states.
     *
     * A better approach would be: Send next value only, if first one got
     * received by "outer" subscriber of a combined observable. The approach
     * here may cause flaky tests, and thus, should be handled with care.
     */
    const fixedIterations = setInterval(() => {
      if (currentState >= maxState) {
        clearInterval(fixedIterations);
        subscriber.complete();
      }
      subscriber.next(states[currentState]);
      currentState++;
    }, 1);
  }

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
 * @param slow if the initially provided value should take some extra amount of time
 */
const createObservable = (
  mode: ConfigState | undefined,
  truthyState: DisplayHint,
  falsyState: DisplayHint,
  config: MockServiceConfig,
  slow: boolean
): Observable<DisplayHint> => {
  return new Observable<DisplayHint>((subscriber) => {
    if (!mode) {
      return initDisplay(subscriber, false, config, slow, falsyState);
    }
    if (mode === true) {
      return initDisplay(subscriber, false, config, slow, truthyState);
    }
    // Mode is changing
    initDisplay(subscriber, true, config, slow, falsyState);
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
    const id = numericId(uriPath);

    // Special case: Only the root folder is represented with empty name.
    if (id === 1) {
      return Promise.resolve("");
    }
    const config = parseContentConfig(uriPath);
    const evil = config.prefix === ContentIdPrefix.evil;
    const slow = config.prefix === ContentIdPrefix.slow;
    const unreadable = !!config.unreadable;
    const maxFirstDelayMs = this.#config.maxFirstDelayMs;
    const delayMs: number = maxFirstDelayMs === undefined ? MAX_FIRST_DELAY_MS : maxFirstDelayMs;
    const timeoutMs = firstDelayMs(slow, delayMs);

    return new Promise<string>((resolve, reject) => {
      setTimeout(() => {
        if (unreadable) {
          return reject(`Content ${uriPath} is unreadable.`);
        }

        const typeName = config.isFolder ? "Folder" : "Document";
        const truthyName = evil ? EVIL_CONTENT_NAME_TRUTHY : CONTENT_NAME_TRUTHY;
        const falsyName = evil ? EVIL_CONTENT_NAME_FALSY : CONTENT_NAME_FALSY;

        return resolve(`${!config.name ? falsyName : truthyName} ${typeName} #${id}`);
      }, timeoutMs);
    });
  }

  /**
   * Combines the observables for name, type and state into one.
   * @param uriPath
   */
  observe_asLink(uriPath: UriPath): Observable<ContentAsLink> {
    const nameSubscription = this.observe_name(uriPath);
    const typeSubscription = this.observe_type(uriPath);
    const stateSubscription = this.observe_state(uriPath);

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

  /**
   * Provides a name which is either static (one of two) or changing over time
   * (between two names). For unreadable contents, an unreadable placeholder
   * is returned. For unreadable-toggle behavior, it toggled between unreadable
   * and one of the two names. This overrides name-toggle behavior.
   *
   * @param uriPath URI path to create mock for
   */
  observe_name(uriPath: UriPath): Observable<DisplayHint> {
    const id = numericId(uriPath);

    if (id === 1) {
      // Root Folder has always only an empty name.
      return createObservable(false, ROOT_DISPLAY_HINT, ROOT_DISPLAY_HINT, this.#config, false);
    }
    const config = parseContentConfig(uriPath);
    const evil = config.prefix === ContentIdPrefix.evil;
    const slow = config.prefix === ContentIdPrefix.slow;
    const typeName = config.isFolder ? "Folder" : "Document";
    const unreadableState: DisplayHint = {
      name: `${CONTENT_NAME_UNREADABLE} ${typeName} #${id}`,
      classes: [],
    };
    const truthyName = evil ? EVIL_CONTENT_NAME_TRUTHY : CONTENT_NAME_TRUTHY;
    const falsyName = evil ? EVIL_CONTENT_NAME_FALSY : CONTENT_NAME_FALSY;

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
        this.#config,
        slow
      );
    }

    return createObservable(config.name, truthyState, falsyState, this.#config, slow);
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
    const slow = config.prefix === ContentIdPrefix.slow;
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
      return createObservable(config.unreadable, unreadableState, falsyState, this.#config, slow);
    }

    return createObservable(state, checkedInState, checkedOutState, this.#config, slow);
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
    const slow = config.prefix === ContentIdPrefix.slow;
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
      return createObservable(config.unreadable, unreadableState, falsyState, this.#config, slow);
    }
    return createObservable(config.isFolder, folderState, documentState, this.#config, slow);
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
      prefix: parsePrefix(numericIdPart),
      isFolder: isFolder,
    };
  }
  return {
    name: identifierToState(parseInt(match[2])),
    prefix: parsePrefix(match[1]),
    unreadable: identifierToState(parseInt(match[3])),
    checkedIn: identifierToState(parseInt(match[4])),
    // in contrast to other flags, we simulate the default CMS here, which is,
    // that even numbers are for documents, while odd numbers are for folders.
    isFolder: parseInt(match[5]) % 2 === 1,
  };
};

/**
 * Creates a content URI path (such as `content/3332002`) based on the
 * given configuration.
 *
 * @param name type of name, or changing
 * @param prefix if a certain prefix shall be used to trigger a specific behavior
 * @param unreadable state of unreadable, or changing
 * @param checkedIn state of checked-in, or changing (not relevant for folders)
 * @param isFolder if the content shall be a folder or a document
 * @param undroppable if the document (not applicable to folders) shall be droppable
 */
const createContentUriPath = ({
                                name,
                                prefix,
                                unreadable,
                                checkedIn,
                                isFolder,
                                undroppable
                              }: CreateContentConfig & DroppableConfig
): UriPath => {
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
  createContentUriPath,
};
