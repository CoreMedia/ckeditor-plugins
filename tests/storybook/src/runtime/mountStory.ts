import type { ClassicEditor } from "ckeditor5";
import {
  EDITOR_ELEMENT_ID,
  EDITOR_READY_ATTRIBUTE,
  SCENARIO_CONTAINER_CLASS,
} from "@coremedia/ckeditor5-itest-constants";
import { defaultScenarioArgs, type ScenarioArgs } from "./scenario";
import { installEditorTestApi } from "./testApi";
import { installOutputsHarness } from "./outputs";

export { EDITOR_ELEMENT_ID, EDITOR_READY_ATTRIBUTE, SCENARIO_CONTAINER_CLASS };

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
 * Initializes an editor for a scenario. Concrete initializers (richtext /
 * bbcode), together with the migrated mock-content setup, are provided by the
 * Storybook story-setup utilities. The signature is the contract: given a host
 * element and the resolved scenario args, return the ready editor instance.
 */
export type ScenarioInitializer = (host: HTMLElement, args: ScenarioArgs) => Promise<ClassicEditor>;

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
  container.appendChild(host);

  void whenAttached(host)
    .then(() => initialize(host, resolvedArgs))
    .then((editor) => {
      window.editor = editor;
      installEditorTestApi(editor);
      installOutputsHarness(container, editor, resolvedArgs);
      container.setAttribute(EDITOR_READY_ATTRIBUTE, "true");
    })
    .catch((error: unknown) => {
      container.setAttribute(EDITOR_READY_ATTRIBUTE, "error");
      console.error("Failed to initialize editor scenario", error);
    });

  return container;
};
