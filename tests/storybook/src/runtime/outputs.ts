import type { ClassicEditor } from "ckeditor5";
import type { RichTextDataProcessor } from "@coremedia/ckeditor5-coremedia-richtext";
import { OUTPUT_TEST_IDS, OUTPUTS_CONTAINER_CLASS, type ScenarioOutput } from "@coremedia/ckeditor5-itest-constants";
import { getEditorData } from "../setup/editorData";
import { getContentFormService } from "../setup/serviceAgent";
import { validateIsDroppableInLinkBalloon, validateIsDroppableState } from "../setup/inputExample";
import type { ScenarioArgs } from "./scenario";

export { OUTPUT_TEST_IDS, OUTPUTS_CONTAINER_CLASS };

/**
 * Polling interval (ms) for outputs that have no change event to subscribe to
 * (service state, dropability evaluation).
 */
const POLL_INTERVAL_MS = 100;

const createOutputElement = (output: ScenarioOutput): HTMLElement => {
  const element = document.createElement("pre");
  element.dataset.test = OUTPUT_TEST_IDS[output];
  return element;
};

const installEditorData = (editor: ClassicEditor, element: HTMLElement): void => {
  const update = (): void => {
    element.textContent = getEditorData(editor);
  };
  update();
  editor.model.document.on("change:data", update);
};

const installDataView = (editor: ClassicEditor, element: HTMLElement): void => {
  const processor = editor.data.processor as RichTextDataProcessor;
  processor.on("richtext:toView", (_eventInfo, eventData: { dataView?: string }) => {
    if (typeof eventData.dataView === "string") {
      element.textContent = eventData.dataView;
    }
  });
  // The scenario data was already set before the harness was installed, so the
  // initial `richtext:toView` fired before we subscribed. Re-set the current
  // data once to populate the output.
  editor.setData(getEditorData(editor));
};

const installLastOpenedEntities = (editor: ClassicEditor, element: HTMLElement): void => {
  void getContentFormService(editor).then((service) => {
    const update = (): void => {
      element.textContent = JSON.stringify(service.getLastOpenedEntities());
    };
    update();
    window.setInterval(update, POLL_INTERVAL_MS);
  });
};

const installDroppableState = (editor: ClassicEditor, element: HTMLElement, uris: string[]): void => {
  const update = (): void => {
    element.textContent = JSON.stringify(validateIsDroppableState(editor, uris) ?? null);
  };
  update();
  window.setInterval(update, POLL_INTERVAL_MS);
};

const installDroppableInLinkBalloon = (editor: ClassicEditor, element: HTMLElement, uris: string[]): void => {
  const update = (): void => {
    element.textContent = JSON.stringify(validateIsDroppableInLinkBalloon(editor, uris) ?? null);
  };
  update();
  window.setInterval(update, POLL_INTERVAL_MS);
};

/**
 * Renders the requested observable outputs as locator-readable DOM into the
 * scenario container. Each output exposes a live value as the text content of a
 * stable `[data-test="…"]` element, so Playwright tests can read editor and
 * service state through locators instead of `page.evaluate`.
 *
 * @param container - scenario container element
 * @param editor - live editor instance
 * @param args - resolved scenario args
 */
export const installOutputsHarness = (container: HTMLElement, editor: ClassicEditor, args: ScenarioArgs): void => {
  if (args.outputs.length === 0) {
    return;
  }

  const outputsContainer = document.createElement("div");
  outputsContainer.classList.add(OUTPUTS_CONTAINER_CLASS);
  container.appendChild(outputsContainer);

  for (const output of args.outputs) {
    const element = createOutputElement(output);
    outputsContainer.appendChild(element);

    switch (output) {
      case "editor-data":
        installEditorData(editor, element);
        break;
      case "data-view":
        installDataView(editor, element);
        break;
      case "last-opened-entities":
        installLastOpenedEntities(editor, element);
        break;
      case "is-droppable-state":
        installDroppableState(editor, element, args.droppableUris);
        break;
      case "is-droppable-in-link-balloon":
        installDroppableInLinkBalloon(editor, element, args.droppableUris);
        break;
    }
  }
};
