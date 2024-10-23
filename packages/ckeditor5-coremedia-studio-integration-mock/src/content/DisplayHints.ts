import MockContent from "./MockContent";
import { map } from "rxjs/operators";
import { combineLatest, Observable } from "rxjs";
import { observeEditing, observeName, observeReadable } from "./MutableProperties";
import { DisplayHint } from "@coremedia/ckeditor5-coremedia-studio-integration";
import Delayed from "./Delayed";
import { capitalize } from "./MockContentUtils";

/**
 * Part of an unreadable content's name (along with its ID).
 */
const CONTENT_NAME_UNREADABLE = "Unreadable";

/**
 * Configuration required to generate name hints for unreadable state.
 */
type UnreadableNameHintConfig = Partial<Pick<MockContent, "id" | "type">>;

/**
 * Configuration required to generate name hints for readable state.
 */
type ReadableNameHintConfig = Pick<MockContent, "name" | "readable">;

/**
 * Configuration for name hint subscription.
 */
type NameHintConfig = Delayed & ReadableNameHintConfig & UnreadableNameHintConfig;

/**
 * Creates a representation for an unreadable content's name.
 *
 * @param config - configuration to create name from
 */
const unreadableName = (config: UnreadableNameHintConfig): string => {
  const { id, type } = config;
  return `${CONTENT_NAME_UNREADABLE} ${capitalize(type ?? "Unknown")} #${id ?? "unset"}`;
};

/**
 * Generates a name hint for unreadable state.
 *
 * @param config - configuration to create display hint
 * @param classes - classes to apply
 */
const unreadableNameHint = (config: UnreadableNameHintConfig, classes: string[] = []): DisplayHint => ({
  name: unreadableName(config),
  classes,
});

/**
 * Provides an observable for the `DisplayHint` of the content-name. Respects
 * the unreadable state, which triggers an alternative name stating that it is
 * unreadable.
 *
 * `id` and `type` are only used in unreadable state.
 *
 * @param config - content configuration
 */
const observeNameHint = (config: NameHintConfig): Observable<DisplayHint> => {
  const observableReadable = observeReadable(config);
  const observableName = observeName(config);
  const combinedObservable = combineLatest([observableName, observableReadable]);
  const classes: string[] = [];
  const unreadableState = unreadableNameHint(config, classes);

  return combinedObservable.pipe(
    map(([name, readable]): DisplayHint => {
      if (!readable) {
        return unreadableState;
      }
      return {
        name,
        classes,
      };
    }),
  );
};

/**
 * Configuration for editing hint subscription.
 */
type EditingHintConfig = Delayed & Pick<MockContent, "editing" | "readable">;

/**
 * Unreadable representation in editing hint.
 */
const unreadableEditingHint: DisplayHint = {
  name: "",
  classes: [],
};

/**
 * Provides an observable for the `DisplayHint` of the editing state (i.e.,
 * checked in or checked out). Respects the unreadable state, which triggers an
 * alternative name state.
 *
 * @param config - content configuration
 */
const observeEditingHint = (config: EditingHintConfig): Observable<DisplayHint> => {
  const observableReadable = observeReadable(config);
  const observableEditing = observeEditing(config);
  const combinedObservable = combineLatest([observableEditing, observableReadable]);
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
        return unreadableEditingHint;
      }
      // We don't respect the type here (folders cannot be checked-out), but
      // we rely on the config not providing folders, which are edited.
      return editing ? editingState : notEditingState;
    }),
  );
};

/**
 * Configuration for type hint subscription.
 */
type TypeHintConfig = Delayed & Pick<MockContent, "type" | "readable">;

/**
 * Unreadable representation in type hint.
 */
const unreadableTypeHint: DisplayHint = {
  name: "Unreadable",
  classes: ["icon--lock"],
};

/**
 * Provides an observable for the `DisplayHint` of the content type.
 * While the type itself is not mutable, the observable respects the unreadable
 * state, so that it may provide a state, which states, that the type cannot
 * be determined, because it is unreadable.
 *
 * @param config - content configuration
 */
const observeTypeHint = (config: TypeHintConfig): Observable<DisplayHint> => {
  const { type } = config;
  const isFolder = "folder" === type;
  const name = capitalize(type);
  const classes = isFolder ? ["icon--folder"] : ["icon--document", `icon--document-${type.toLowerCase()}`];
  const observableReadable = observeReadable(config);
  const typeHint: DisplayHint = {
    name,
    classes,
  };
  return observableReadable.pipe(map((readable): DisplayHint => (readable ? typeHint : unreadableTypeHint)));
};

export {
  EditingHintConfig,
  NameHintConfig,
  ReadableNameHintConfig,
  TypeHintConfig,
  UnreadableNameHintConfig,
  observeEditingHint,
  observeNameHint,
  observeTypeHint,
  unreadableEditingHint,
  unreadableName,
  unreadableNameHint,
  unreadableTypeHint,
};
