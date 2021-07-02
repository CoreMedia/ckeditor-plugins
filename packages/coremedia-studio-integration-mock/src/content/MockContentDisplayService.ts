import ContentDisplayService, {
  DisplayHint,
} from "@coremedia/coremedia-studio-integration/src/content/ContentDisplayService";
import { Observable, Subscriber, TeardownLogic } from "rxjs";
import { UriPath, numericId } from "@coremedia/coremedia-studio-integration/src/content/UriPath";

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
 * Calculate the first delay; adds some randomness.
 */
const firstDelayMs = (): number => {
  return Math.random() * MAX_FIRST_DELAY_MS;
};

/**
 * Create the initial display.
 * @param subscriber subscriber to inform
 * @param initial initial display
 */
const initDisplay = (subscriber: Subscriber<DisplayHint>, initial: DisplayHint): void => {
  setTimeout(() => {
    subscriber.next(initial);
  }, firstDelayMs());
};

/**
 * Sets up toggling behavior of display state.
 * @param subscriber subscriber to inform on changes
 * @param firstState first state to enter
 * @param otherStates other states to follow
 * @return TeardownLogic function to stop the timer on unsubscribe
 */
const initToggle = (
  subscriber: Subscriber<DisplayHint>,
  firstState: DisplayHint,
  ...otherStates: DisplayHint[]
): TeardownLogic => {
  const states = [firstState, ...otherStates];
  const maxState = states.length;
  let currentState = 0;

  const timerId = setInterval(() => {
    subscriber.next(states[currentState]);
    currentState = (currentState + 1) % maxState;
  }, CHANGE_DELAY_MS);
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
 */
const createObservable = (
  mode: ConfigState | undefined,
  truthyState: DisplayHint,
  falsyState: DisplayHint
): Observable<DisplayHint> => {
  return new Observable<DisplayHint>((subscriber) => {
    if (!mode) {
      return initDisplay(subscriber, falsyState);
    }
    if (mode === true) {
      return initDisplay(subscriber, truthyState);
    }
    // Mode is changing
    initDisplay(subscriber, falsyState);
    return initToggle(subscriber, truthyState, falsyState);
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
 *   <checkedIn: 0|1|2>
 *   <name: 0|2>
 *   <unreadable: 0|1|2>
 *   <checkedIn: 0|1|2>
 *   <folderType: 0|1>
 * ```
 *
 * **checkedIn:** 0 = checked out, 1 = checked in, 2 = changing
 *
 * **name:** 0 = some name, 2 = changing name
 *
 * **unreadable:** 0 = readable, 1 = unreadable, 2 = changing
 *
 * **checkedIn:** 0 = checked out, 1 = checked in, 2 = changing
 *
 * **folderType:** 0 = document, 1 = folder
 *
 * If any of these is unmatched, the default state will be chosen, which is:
 * checked out, some name, readable, document.
 */
class MockContentDisplayService implements ContentDisplayService {
  getName(): string {
    return "contentDisplayService";
  }

  getDisplayHint(uriPath: UriPath): Observable<DisplayHint> {
    const config = parseContentConfig(uriPath);
    const id = numericId(uriPath);

    // true or changing
    if (!!config.unreadable) {
      return createObservable(
        config.unreadable,
        {
          name: `Unreadable #${id}`,
          classes: [],
        },
        {
          name: `Content #${id}`,
          classes: ["content--0"],
        }
      );
    }

    return createObservable(
      config.name,
      {
        name: `Lorem #${id}`,
        classes: [],
      },
      {
        name: `Ipsum #${id}`,
        classes: ["content--0"],
      }
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

    if (!!config.unreadable) {
      const falsyState = !!config.checkedIn ? checkedInState : checkedOutState;
      return createObservable(config.unreadable, unreadableState, falsyState);
    }

    return createObservable(config.checkedIn, checkedInState, checkedOutState);
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
      return createObservable(config.isFolder, unreadableState, falsyState);
    }
    return createObservable(config.isFolder, folderState, documentState);
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
  name?: false | typeof changing$;
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
  const configPattern = /^content\/\d+(?<namechange>[02])(?<unreadable>[0-2])(?<checkedin>[0-2])(?<isfolder>[0-1])/;
  const match = configPattern.exec(uriPath);

  if (!match) {
    // All defaults
    return {};
  }
  return {
    name: match[1] === "0" ? false : changing$,
    unreadable: identifierToState(parseInt(match[2])),
    checkedIn: identifierToState(parseInt(match[3])),
    isFolder: match[4] === "1",
  };
};

const createContentUriPath = ({ name, unreadable, checkedIn, isFolder }: CreateContentConfig): UriPath => {
  function randomPrefix(): number {
    return Math.floor(Math.random() * 99);
  }

  return `content/${randomPrefix()}${stateToIdentifier(name)}${stateToIdentifier(unreadable)}${stateToIdentifier(
    checkedIn
  )}${stateToIdentifier(isFolder)}`;
};

export default MockContentDisplayService;
export { createContentUriPath };
