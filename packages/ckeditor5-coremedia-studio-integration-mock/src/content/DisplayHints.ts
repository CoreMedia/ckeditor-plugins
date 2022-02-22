import MockContent from "./MockContent";
import { map } from "rxjs/operators";
import { combineLatest, Observable } from "rxjs";
import { observeEditing, observeName, observeReadable } from "./MutableProperties";
import DisplayHint from "@coremedia/ckeditor5-coremedia-studio-integration/content/DisplayHint";
import Delayed from "./Delayed";
import { capitalize } from "./MockContentUtils";

/**
 * Part of an unreadable content's name (along with its ID).
 */
const CONTENT_NAME_UNREADABLE = "Unreadable";

/**
 * Provides an observable for the `DisplayHint` of the content-name. Respects
 * the unreadable state, which triggers an alternative name stating that it is
 * unreadable.
 *
 * `id` and `type` are only used in unreadable state.
 *
 * @param config - content configuration
 */
const observeNameHint = (
  config: Delayed & Pick<MockContent, "name" | "readable"> & Partial<Pick<MockContent, "id" | "type">>
): Observable<DisplayHint> => {
  const { id, type } = config;
  const observableReadable = observeReadable(config);
  const observableName = observeName(config);
  const combinedObservable = combineLatest([observableName, observableReadable]);
  const classes: string[] = [];
  const unreadableState: DisplayHint = {
    name: `${CONTENT_NAME_UNREADABLE} ${capitalize(type ?? "Unknown")} #${id ?? "unset"}`,
    classes,
  };

  return combinedObservable.pipe(
    map(([name, readable]): DisplayHint => {
      if (!readable) {
        return unreadableState;
      }
      return {
        name,
        classes,
      };
    })
  );
};

/**
 * Provides an observable for the `DisplayHint` of the editing state (i.e.,
 * checked in or checked out). Respects the unreadable state, which triggers an
 * alternative name state.
 *
 * @param config - content configuration
 */
const observeEditingHint = (config: Delayed & Pick<MockContent, "editing" | "readable">): Observable<DisplayHint> => {
  const observableReadable = observeReadable(config);
  const observableEditing = observeEditing(config);
  const combinedObservable = combineLatest([observableEditing, observableReadable]);
  const unreadableState: DisplayHint = {
    name: "",
    classes: [],
  };
  const editingState: DisplayHint = {
    name: "Checked Out",
    classes: ["icon--checked-out"],
  };
  const notEditingState: DisplayHint = {
    name: "Checked In",
    classes: ["icon--checked-in"],
  };

  return combinedObservable.pipe(
    map(([editing, readable]): DisplayHint => {
      if (!readable) {
        return unreadableState;
      }
      // We don't respect the type here (folders cannot be checked-out), but
      // we rely on the config not providing folders, which are edited.
      return editing ? editingState : notEditingState;
    })
  );
};

/**
 * Provides an observable for the `DisplayHint` of the content type.
 * While the type itself is not mutable, the observable respects the unreadable
 * state, so that it may provide a state, which states, that the type cannot
 * be determined, because it is unreadable.
 *
 * @param config - content configuration
 */
const observeTypeHint = (config: Delayed & Pick<MockContent, "type" | "readable">): Observable<DisplayHint> => {
  const { type } = config;
  const isFolder = "folder" === type;
  const name = capitalize(type);
  const classes = isFolder ? ["icon--folder"] : ["icon--document", `icon--document-${type.toLowerCase()}`];
  const observableReadable = observeReadable(config);
  const unreadableState: DisplayHint = {
    name: "Unreadable",
    classes: ["icon--lock"],
  };
  const typeHint: DisplayHint = {
    name,
    classes,
  };
  return observableReadable.pipe(
    map((readable): DisplayHint => {
      return readable ? typeHint : unreadableState;
    })
  );
};

export { observeNameHint, observeEditingHint, observeTypeHint };
