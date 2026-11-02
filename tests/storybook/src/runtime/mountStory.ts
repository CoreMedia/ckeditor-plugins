import type { ClassicEditor } from "ckeditor5";
import {
  EDITOR_ELEMENT_ID,
  EDITOR_READY_ATTRIBUTE,
  SCENARIO_CONTAINER_CLASS,
  SHADOW_HOST_CLASS,
} from "@coremedia/ckeditor5-itest-constants";
import { defaultScenarioArgs, type ScenarioArgs } from "./scenario";
import { installOutputsHarness } from "./outputs";
import { attachEditorShadowRoot, createOverlayContainer } from "./shadowDom";

export { EDITOR_ELEMENT_ID, EDITOR_READY_ATTRIBUTE, SCENARIO_CONTAINER_CLASS, SHADOW_HOST_CLASS };

declare global {
  interface Window {
    /**
     * The editor instance is exposed globally once ready, mirroring the former
     * application behavior so handle-based access keeps working during the
     * migration.
     */
    editor?: ClassicEditor;
  }
}

/**
 * DOM context the scenario was mounted into, as prepared by
 * {@link mountScenario}.
 */
export interface ScenarioMountContext {
  /**
   * Container for CKEditor's floating UI, to be passed as
   * `config.ui.overlayContainer`. Only set when the scenario is mounted with
   * `shadowDom: true`.
   */
  overlayContainer?: ShadowRoot;
}

/**
 * Initializes an editor for a scenario. Concrete initializers (richtext /
 * bbcode), together with the migrated mock-content setup, are provided by the
 * Storybook story-setup utilities. The signature is the contract: given a host
 * element, the resolved scenario args and the mount context, return the ready
 * editor instance and a cleanup function that undoes any side-effects (e.g.
 * DOM elements added to document.body).
 */
export type ScenarioInitializer = (
  host: HTMLElement,
  args: ScenarioArgs,
  context: ScenarioMountContext,
) => Promise<{ editor: ClassicEditor; cleanup: () => void }>;

/**
 * Resolves once the given element is attached to the document. CKEditor's
 * `create` requires the source element to be connected to the DOM, but
 * Storybook attaches a `render` result only after it has been returned. We
 * therefore defer editor initialization until the host is connected.
 *
 * @param element - element to await attachment for
 */
const whenAttached = (element: HTMLElement): Promise<void> =>
  new Promise((resolve) => {
    if (element.isConnected) {
      resolve();
      return;
    }
    const check = (): void => {
      if (element.isConnected) {
        resolve();
        return;
      }
      requestAnimationFrame(check);
    };
    requestAnimationFrame(check);
  });

/**
 * Renders a scenario container, mounts the editor host element into it and
 * kicks off asynchronous initialization. The container is returned
 * synchronously so it can be used directly as a Storybook `render` result.
 *
 * Readiness contract:
 * - while initializing, the container has no `data-editor-ready` attribute,
 * - on success, `window.editor` is set and `data-editor-ready="true"`,
 * - on failure, `data-editor-ready="error"` is set and the error is logged.
 *
 * With `shadowDom: true`, the editor host element is placed inside the open
 * shadow root of a {@link SHADOW_HOST_CLASS} element within the container, and
 * an overlay container for the floating UI is appended to `document.body`
 * (see `shadowDom.ts`). The container itself, and with it the readiness
 * attribute and the outputs harness, stays in the light DOM.
 *
 * @param initialize - scenario initializer that creates the editor
 * @param args - partial scenario args merged over {@link defaultScenarioArgs}
 * @returns the scenario container element
 */
export const mountScenario = (initialize: ScenarioInitializer, args?: Partial<ScenarioArgs>): HTMLElement => {
  const resolvedArgs: ScenarioArgs = { ...defaultScenarioArgs, ...args };

  const container = document.createElement("div");
  container.classList.add(SCENARIO_CONTAINER_CLASS);
  container.removeAttribute(EDITOR_READY_ATTRIBUTE);

  const host = document.createElement("div");
  host.id = EDITOR_ELEMENT_ID;
  if (resolvedArgs.shadowDom) {
    const shadowHost = document.createElement("div");
    shadowHost.classList.add(SHADOW_HOST_CLASS);
    container.appendChild(shadowHost);
    attachEditorShadowRoot(shadowHost).appendChild(host);
  } else {
    container.appendChild(host);
  }

  let removeOverlayContainer = (): void => {};

  void whenAttached(host)
    .then(() => {
      const context: ScenarioMountContext = {};
      if (resolvedArgs.shadowDom) {
        const { overlayContainer, remove } = createOverlayContainer();
        context.overlayContainer = overlayContainer;
        removeOverlayContainer = remove;
      }
      return initialize(host, resolvedArgs, context);
    })
    .then(({ editor, cleanup: scenarioCleanup }) => {
      window.editor = editor;
      const outputsCleanup = installOutputsHarness(container, editor, resolvedArgs);
      const cleanup = (): void => {
        scenarioCleanup();
        outputsCleanup();
        removeOverlayContainer();
        if (window.editor === editor) {
          delete window.editor;
        }
      };
      // MutationObserver is the only way to detect removal without
      // changing every story's render function.
      const observer = new MutationObserver(() => {
        if (!container.isConnected) {
          observer.disconnect();
          cleanup();
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
      container.setAttribute(EDITOR_READY_ATTRIBUTE, "true");
    })
    .catch((error: unknown) => {
      removeOverlayContainer();
      container.setAttribute(EDITOR_READY_ATTRIBUTE, "error");
      console.error("Failed to initialize editor scenario", error);
    });

  return container;
};
