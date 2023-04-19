import { type ContextualBalloon } from "@ckeditor/ckeditor5-ui";
import { LinkUI } from "@ckeditor/ckeditor5-link";

/**
 * We require accessing some of the internal properties/methods of `LinkUI`.
 * This interface exposes the internal API, we need to access and may
 * need to adapt upon CKEditor 5 upgrade.
 */
export interface InternalLinkUI {
  _balloon: ContextualBalloon;
  /**
   * Removes the `formView` from the `_balloon`.
   */
  _hideUI(): void;
  get _isUIInPanel(): boolean;
}

const isHasBalloon = (linkUI: object): linkUI is Pick<InternalLinkUI, "_balloon"> =>
  "_balloon" in linkUI && typeof linkUI._balloon === "boolean";

const isHasHideUI = (linkUI: object): linkUI is Pick<InternalLinkUI, "_hideUI"> =>
  "_hideUI" in linkUI && typeof linkUI._hideUI === "function";

const isHasIsUIInPanel = (linkUI: object): linkUI is Pick<InternalLinkUI, "_isUIInPanel"> =>
  "_isUIInPanel" in linkUI && typeof linkUI._isUIInPanel === "boolean";

const isInternalLinkUI = (linkUI: unknown): linkUI is LinkUI & InternalLinkUI =>
  typeof linkUI === "object" && !!linkUI && isHasBalloon(linkUI) && isHasHideUI(linkUI) && isHasIsUIInPanel(linkUI);

/**
 * Type-guard for internal LinkUI with side effect.
 *
 * As a side effect, for unmatched internal API, a warning is filed. This is
 * because we need to be aware of internal API changes we need to respond to.
 *
 * **Usage Example:**
 *
 * ```typescript
 * const internalLinkUI: unknown = linkUI;
 * if (hasRequiredInternalLinkUI(internalLinkUI)) {
 *   // ...
 * }
 * ```
 *
 * Thus, we need to first make it `unknown` as it will otherwise collide with
 * fields declared as private in `LinkUI`.
 *
 * @param linkUI - the LinkUI to check, if required internal API is available
 */
export const hasRequiredInternalLinkUI = (linkUI: unknown): linkUI is InternalLinkUI => {
  const result = isInternalLinkUI(linkUI);
  console.warn(
    "requireInternalLinkUI: Required internal API of LinkUI unavailable. Most likely, internal API changed on CKEditor 5 upgrade and needs to be adapted."
  );
  return result;
};
