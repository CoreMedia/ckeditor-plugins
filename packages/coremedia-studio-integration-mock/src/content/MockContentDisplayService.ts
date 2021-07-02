import ContentDisplayService from "@coremedia/coremedia-studio-integration/src/content/ContentDisplayService";
import { DisplayHint } from "@coremedia/coremedia-studio-integration/dist/content/ContentDisplayService";
import { Observable } from "rxjs";
import { UriPath } from "@coremedia/coremedia-studio-integration/dist/content/UriPath";
import { numericId } from "@coremedia/coremedia-studio-integration/src/content/UriPath";

const ROOT_FOLDER_URI_PATH = "content/1";

const CHECKED_OUT_HINT: DisplayHint = {
  name: "checked out",
  classes: ["icon", "icon--checked-out"],
};

// https://stackoverflow.com/questions/63746463/how-to-create-enum-values-as-type-interface-in-typescript
const MockState = {
  CHECKED_OUT: CHECKED_OUT_HINT,
} as const;

type MockStateObject = typeof MockState;
type MockState = MockStateObject[keyof MockStateObject];

const FIRST_DELAY_MS = 100;
const CHANGE_DELAY_MS = 30000;

class MockContentDisplayService implements ContentDisplayService {
  getName(): string {
    return "contentDisplayService";
  }

  /*
  * TODO: TypeScript COP!!!!!
   */

  getDisplayHint(uriPath: UriPath): Observable<DisplayHint> {
    const config = parseContentConfig(uriPath);
    const names = [`Content (0) #${numericId(uriPath)}`, `Content (1) #${numericId(uriPath)}`];
    const styleClasses = ["content--0", "content--1"];

    // https://rxjs-dev.firebaseapp.com/guide/observable
    // Provide "constant name changing
    return new Observable<DisplayHint>((subscriber) => {
      setTimeout(() => {
        subscriber.next({
          name: names[0],
          classes: [styleClasses[0]],
        });
      }, FIRST_DELAY_MS);

      if (config.name === changing$) {
        let state = true;
        const timerId = setInterval(() => {
          subscriber.next({
            name: names[state ? 1 : 0],
            classes: [styleClasses[state ? 1 : 0]],
          });
          state = !state;
        }, CHANGE_DELAY_MS);
        // Unsubscribe function
        return () => {
          clearInterval(timerId);
        };
      }
    });
  }

  getStateDisplayHint(uriPath: UriPath): Observable<DisplayHint> {
    return new Observable<DisplayHint>();
  }

  getTypeDisplayHint(uriPath: UriPath): Observable<DisplayHint> {
    return new Observable<DisplayHint>();
  }
}

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

  return `content/${randomPrefix()}${stateToIdentifier(name)}${stateToIdentifier(unreadable)}${stateToIdentifier(checkedIn)}${stateToIdentifier(isFolder)}`;
};

export default MockContentDisplayService;
