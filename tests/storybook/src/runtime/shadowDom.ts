import { OVERLAY_HOST_CLASS } from "@coremedia/ckeditor5-itest-constants";
import editorStyles from "ckeditor5/ckeditor5.css?raw";
import contentStyles from "../../.storybook/content-styles.css?raw";

export { OVERLAY_HOST_CLASS };

let editorStyleSheets: CSSStyleSheet[] | undefined;

/**
 * Constructed style sheets with the CKEditor styles and the test content
 * styles (`.storybook/content-styles.css`). Page style sheets do not cross a
 * shadow boundary, so every shadow root holding editor UI has to adopt these.
 * Created once and shared by all roots.
 */
const getEditorStyleSheets = (): CSSStyleSheet[] => {
  editorStyleSheets ??= [editorStyles, contentStyles].map((css) => {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(css);
    return sheet;
  });
  return editorStyleSheets;
};

/**
 * Attaches an open shadow root to the given element and adopts the editor
 * style sheets into it.
 *
 * @param shadowHost - element to attach the shadow root to
 * @returns the attached shadow root
 */
export const attachEditorShadowRoot = (shadowHost: HTMLElement): ShadowRoot => {
  const shadowRoot = shadowHost.attachShadow({ mode: "open" });
  shadowRoot.adoptedStyleSheets = getEditorStyleSheets();
  return shadowRoot;
};

/**
 * Creates the overlay container for an editor mounted inside a shadow root: an
 * open shadow root on a host element appended to the end of `document.body`,
 * as recommended by CKEditor for `config.ui.overlayContainer`. As a direct
 * child of the body, no ancestor can clip or misplace the floating UI.
 *
 * @returns the overlay container and a function removing its host element
 */
export const createOverlayContainer = (): { overlayContainer: ShadowRoot; remove: () => void } => {
  const overlayHost = document.createElement("div");
  overlayHost.classList.add(OVERLAY_HOST_CLASS);
  document.body.appendChild(overlayHost);
  return {
    overlayContainer: attachEditorShadowRoot(overlayHost),
    remove: () => overlayHost.remove(),
  };
};
