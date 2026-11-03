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
 * Constructed copies of the document style sheets, keyed by their owner node
 * and recreated only when the source text changes.
 */
const documentSheetMirrors = new WeakMap<Node, { source: string; sheet: CSSStyleSheet }>();

/**
 * Shadow roots that mirror the document style sheets.
 */
const mirroringRoots = new Set<ShadowRoot>();

let headObserver: MutationObserver | undefined;
let syncScheduled = false;

/**
 * Returns the CSS source of a document style sheet, or `undefined` if it
 * cannot be read (e.g. cross-origin style sheets).
 */
const getStyleSheetSource = (sheet: CSSStyleSheet): string | undefined => {
  if (sheet.ownerNode instanceof HTMLStyleElement) {
    return sheet.ownerNode.textContent ?? "";
  }
  try {
    return Array.from(sheet.cssRules, (rule) => rule.cssText).join("\n");
  } catch {
    return undefined;
  }
};

/**
 * Constructed copies of all document style sheets, in document order.
 *
 * Plugins load their styles as side-effect imports (e.g.
 * `import "../../theme/linkformviewextension.css"`), which end up as style
 * sheets of the document. Mirroring them applies to shadow roots the same
 * styles as to the light DOM, without having to know every plugin style sheet.
 */
const getDocumentStyleSheetMirrors = (): CSSStyleSheet[] => {
  const mirrors: CSSStyleSheet[] = [];
  for (const sheet of Array.from(document.styleSheets)) {
    const { ownerNode } = sheet;
    const source = ownerNode && !sheet.disabled ? getStyleSheetSource(sheet) : undefined;
    if (!ownerNode || source === undefined) {
      continue;
    }
    let mirror = documentSheetMirrors.get(ownerNode);
    if (mirror?.source !== source) {
      const mirrorSheet = new CSSStyleSheet({ media: sheet.media.mediaText });
      // `@import` rules are not supported in constructed style sheets and are ignored.
      mirrorSheet.replaceSync(source);
      mirror = { source, sheet: mirrorSheet };
      documentSheetMirrors.set(ownerNode, mirror);
    }
    mirrors.push(mirror.sheet);
  }
  return mirrors;
};

/**
 * Adopts the editor style sheets, followed by the mirrored document style
 * sheets, into all mirroring shadow roots.
 */
const syncStyleSheets = (): void => {
  syncScheduled = false;
  const sheets = [...getEditorStyleSheets(), ...getDocumentStyleSheetMirrors()];
  for (const root of mirroringRoots) {
    root.adoptedStyleSheets = sheets;
  }
};

const scheduleSync = (): void => {
  if (!syncScheduled) {
    syncScheduled = true;
    queueMicrotask(syncStyleSheets);
  }
};

/**
 * Keeps the mirrored style sheets up to date while styles are added, removed
 * or updated (e.g. by hot module replacement) and `<link>` style sheets load.
 */
const startObservingDocumentStyles = (): void => {
  if (headObserver) {
    return;
  }
  headObserver = new MutationObserver(scheduleSync);
  headObserver.observe(document.head, { childList: true, subtree: true, characterData: true });
  document.head.addEventListener("load", scheduleSync, true);
};

const stopObservingDocumentStyles = (): void => {
  headObserver?.disconnect();
  headObserver = undefined;
  document.head.removeEventListener("load", scheduleSync, true);
};

/**
 * Attaches an open shadow root to the given element and adopts the editor
 * style sheets and the document style sheets into it. The adopted document
 * style sheets are kept in sync until the shadow root is released.
 *
 * @param shadowHost - element to attach the shadow root to
 * @returns the attached shadow root and a function to stop syncing its styles
 */
export const attachEditorShadowRoot = (shadowHost: HTMLElement): { shadowRoot: ShadowRoot; release: () => void } => {
  const shadowRoot = shadowHost.attachShadow({ mode: "open" });
  mirroringRoots.add(shadowRoot);
  startObservingDocumentStyles();
  syncStyleSheets();
  return {
    shadowRoot,
    release: () => {
      mirroringRoots.delete(shadowRoot);
      if (mirroringRoots.size === 0) {
        stopObservingDocumentStyles();
      }
    },
  };
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
  const { shadowRoot, release } = attachEditorShadowRoot(overlayHost);
  return {
    overlayContainer: shadowRoot,
    remove: () => {
      release();
      overlayHost.remove();
    },
  };
};
