import { Plugin } from "ckeditor5";
import { reportInitEnd, reportInitStart } from "@coremedia/ckeditor5-core-common";
import { serviceAgent } from "@coremedia/service-agent";
import MockDragDropService from "./MockDragDropService";
import {
  createClipboardServiceDescriptor,
  IsDroppableEvaluationResult,
  isDroppableUris,
  IsLinkableEvaluationResult,
  isLinkableUris,
} from "@coremedia/ckeditor5-coremedia-studio-integration";
import { Logger, LoggerProvider } from "@coremedia/ckeditor5-logging";

/**
 * Describes a div-element that can be created by this plugin.
 * A `InputExampleElement` contains all data that are necessary to make the created
 * div-element drag &amp; drop and paste ready.
 */
export interface InputExampleElement {
  /**
   * The visible text on the div element.
   */
  label: string;
  /**
   * the tooltip on hover of the element
   */
  tooltip: string;
  /**
   * classes added to the div element.
   */
  classes: string[];
  /**
   * Content ids or ExternalContents to create the input information for studio services from.
   */
  items: (number | ExternalContent)[];
}

/**
 * Represents an external content. An External Content is an item which is not
 * a content but a third-party item known to be converted to a content by the embedding system.
 */
export interface ExternalContent {
  externalId: number;
}

export const isAnExternalContent = (obj: number | object): boolean => {
  if (typeof obj === "number") {
    return false;
  }
  return "externalId" in obj;
};
const PLUGIN_NAME = "MockInputExamplePlugin";

/**
 * A Plugin to create drag & drop mock data inside the example app and tests.
 */
class MockInputExamplePlugin extends Plugin {
  static readonly pluginName: string = PLUGIN_NAME;
  static readonly #logger: Logger = LoggerProvider.getLogger(this.pluginName);

  init(): void {
    const initInformation = reportInitStart(this);
    reportInitEnd(initInformation);
  }

  createInsertElement(data: InputExampleElement): HTMLDivElement {
    const insertDiv = document.createElement("div");
    insertDiv.classList.add("input-example", ...(data.classes || []));
    insertDiv.draggable = true;
    insertDiv.textContent = data.label || "Unset";
    insertDiv.dataset.uripath = MockInputExamplePlugin.#generateUriPathCsv(data.items || []);
    insertDiv.title = `${data.tooltip} (${insertDiv.dataset.uripath})`;
    insertDiv.addEventListener("dragstart", MockInputExamplePlugin.#setDragData);
    insertDiv.addEventListener("dblclick", (event): void => {
      MockInputExamplePlugin.#setClipboardData(event)
        .then(() => MockInputExamplePlugin.#logger.debug("Successfully copied data to the content clipboard"))
        .catch((reason: string) => {
          MockInputExamplePlugin.#logger.warn("Could not set clipboard data", reason);
        });
    });
    insertDiv.addEventListener("dragend", MockInputExamplePlugin.#removeDropData);
    return insertDiv;
  }

  /**
   * Triggers the evaluation if the given uris are droppable in the richtext.
   *
   * First call triggers the evaluation while subsequent calls will just return
   * the evaluation state, which means either "PENDING" or the result.
   *
   * This is needed for "dragover" because the event is executed synchronously
   * but multiple times (when moving the cursor further).
   *
   * This function can be used in tests to ensure a drop is allowed.
   *
   * @param uris - the uris to evaluate if they are droppable.
   */
  ensureIsDroppableInRichTextIsEvaluated(uris: string[]): IsDroppableEvaluationResult | undefined {
    return isDroppableUris(uris);
  }

  /**
   * Triggers the evaluation if the given uris are linkable in the richtext.
   *
   * First call triggers the evaluation while subsequent calls will just return
   * the evaluation state, which means either "PENDING" or the result.
   *
   * This is needed for "dragover" because the event is executed synchronously
   * but multiple times (when moving the cursor further).
   *
   * This function can be used in tests to ensure a drop is allowed.
   *
   * @param uris - the uris to evaluate if they are linkable.
   */
  ensureIsDroppableInLinkBalloon(uris: string[]): IsLinkableEvaluationResult | undefined {
    return isLinkableUris(uris);
  }

  static async #setClipboardData(event: MouseEvent): Promise<void> {
    const target = event.target as HTMLElement;
    const contentIdCommaSeparated = target.getAttribute("data-uripath");
    if (!contentIdCommaSeparated) {
      return;
    }
    const contentIds: string[] = contentIdCommaSeparated.split(",");
    const urilistJSON = JSON.stringify(contentIds);
    const blob = new Blob([urilistJSON], {
      type: "cm-studio-rest/uri-list",
    });
    const data: Record<string, Blob> = {};
    data[blob.type] = blob;
    const clipboardService = await serviceAgent.fetchService(createClipboardServiceDescriptor());
    await clipboardService.setItems(
      [
        {
          data,
          options: "copy",
        },
      ],
      new Date().getTime(),
    );
  }

  /**
   * Set the drag data stored in the attribute data-uripath to the
   * `dragEvent.dataTransfer` and to the dragDropService in studio.
   *
   * @param dragEvent the drag event
   */
  static #setDragData(dragEvent: DragEvent): void {
    const dragEventTarget = dragEvent.target as HTMLElement;
    const contentId = dragEventTarget.getAttribute("data-uripath");
    if (contentId) {
      const idsArray = contentId.split(",");
      const urisAsJson = JSON.stringify(idsArray);
      const dataTransferItems: Record<string, string> = {};
      dataTransferItems["cm-studio-rest/uri-list"] = urisAsJson;
      const dragDropService = new MockDragDropService();
      dragDropService.dataTransferItems = JSON.stringify(dataTransferItems);
      serviceAgent.registerService(dragDropService);
      dragEvent.dataTransfer?.setData("cm-studio-rest/uri-list", urisAsJson);
      MockInputExamplePlugin.#logger.debug("Successfully put data on dragdrop service", urisAsJson);
      return;
    }
    const text = dragEventTarget.childNodes[0].textContent;
    if (text) {
      dragEvent.dataTransfer?.setData("text/plain", text);
    }
  }

  /**
   * Unregister the old dragDropService.
   */
  static #removeDropData(): void {
    serviceAgent.unregisterServices("dragDropService");
  }

  static #generateUriPath(item: number | ExternalContent): string {
    const prefix: string = isAnExternalContent(item) ? "externalUri" : "content";
    const id: number = isAnExternalContent(item) ? (item as ExternalContent).externalId : (item as number);
    return `${prefix}/${id}`;
  }

  static #generateUriPathCsv(items: (number | ExternalContent)[]): string {
    return items.map((item) => MockInputExamplePlugin.#generateUriPath(item)).join(",");
  }
}

export default MockInputExamplePlugin;
