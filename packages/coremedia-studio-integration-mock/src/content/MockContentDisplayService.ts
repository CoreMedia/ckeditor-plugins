import ContentDisplayService, {
  DisplayHint,
} from "@coremedia/coremedia-studio-integration/src/content/ContentDisplayService";
import { Observable, Subscriber, TeardownLogic } from "rxjs";
// TODO[cke] Import does not work in IntelliJ Idea (it requires src/ in path).
//@ts-ignore
import { numericId } from "@coremedia/coremedia-studio-integration/content/UriPath";
// TODO[cke] Import does not work in IntelliJ Idea (it requires src/ in path).
//@ts-ignore
import { UriPath } from "@coremedia/coremedia-studio-integration/content/UriPath";

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
  initial: DisplayHint): void => {
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

  constructor(config?: MockServiceConfig) {
    this.#config = !config ? {} : { ...config };
  }

  getName(): string {
    return "contentDisplayService";
  }

  getDisplayHint(uriPath: UriPath): Observable<DisplayHint> {
    const config = parseContentConfig(uriPath);
    const id = numericId(uriPath);
    const typeName = config.isFolder ? "Folder" : "Document";

    // true or changing
    if (!!config.unreadable) {
      return createObservable(
        config.unreadable,
        {
          name: `${CONTENT_NAME_UNREADABLE} ${typeName} #${id}`,
          classes: [],
        },
        {
          name: `${typeName} #${id}`,
          classes: ["content--0"],
        },
        this.#config
      );
    }

    return createObservable(
      config.name,
      {
        name: `${CONTENT_NAME_TRUTHY} ${typeName} #${id}`,
        classes: ["content--1"],
      },
      {
        name: `${CONTENT_NAME_FALSY} ${typeName} #${id}`,
        classes: ["content--0"],
      },
      this.#config
    );
  }

  getStateDisplayHint(uriPath: UriPath): Observable<DisplayHint> {
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

  getTypeDisplayHint(uriPath: UriPath): Observable<DisplayHint> {
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
      return createObservable(config.isFolder, unreadableState, falsyState, this.#config);
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

const parseContentConfig = (uriPath: UriPath): CreateContentConfig => {
  const configPattern = /^content\/\d+(?<namechange>[0-2])(?<unreadable>[0-2])(?<checkedin>[0-2])(?<isfolder>[0-9])$/;
  const match = configPattern.exec(uriPath);

  if (!match) {
    const uriPathPattern = /^content\/(?<id>\d+)$/;
    const uriPathMatch = uriPathPattern.exec(uriPath);
    const isFolder = uriPathMatch && parseInt(uriPathMatch[1]) % 2 === 1;
    // (Nearly) all defaults
    return {
      isFolder: !!isFolder,
    };
  }
  return {
    name: identifierToState(parseInt(match[1])),
    unreadable: identifierToState(parseInt(match[2])),
    checkedIn: identifierToState(parseInt(match[3])),
    // in contrast to other flags, we simulate the default CMS here, which is,
    // that even numbers are for documents, while odd numbers are for folders.
    isFolder: parseInt(match[4]) % 2 === 1,
  };
};

// TODO[cke] If unused, remove; otherwise, add unit tests
const createContentUriPath = ({ name, unreadable, checkedIn, isFolder }: CreateContentConfig): UriPath => {
  function randomPrefix(): number {
    return Math.floor(Math.random() * 99);
  }

  return `content/${randomPrefix()}${stateToIdentifier(name)}${stateToIdentifier(unreadable)}${stateToIdentifier(
    checkedIn
  )}${stateToIdentifier(isFolder)}`;
};

export default MockContentDisplayService;
export { CONTENT_NAME_UNREADABLE, CONTENT_NAME_TRUTHY, CONTENT_NAME_FALSY, createContentUriPath };
