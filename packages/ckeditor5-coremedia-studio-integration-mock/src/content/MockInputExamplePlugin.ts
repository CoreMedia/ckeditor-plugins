import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import { reportInitEnd, reportInitStart } from "@coremedia/ckeditor5-core-common/Plugins";
import { serviceAgent } from "@coremedia/service-agent";
import MockDragDropService from "./MockDragDropService";
import DragDropAsyncSupport from "@coremedia/ckeditor5-coremedia-studio-integration/content/DragDropAsyncSupport";
import { contentUriPath } from "@coremedia/ckeditor5-coremedia-studio-integration/content/UriPath";
import { BeanReference } from "@coremedia/ckeditor5-coremedia-studio-integration/content/BeanReference";
import { createClipboardServiceDescriptor } from "@coremedia/ckeditor5-coremedia-studio-integration/content/ClipboardServiceDesriptor";

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
   * content ids to create the input information for studio services from.
   */
  items: number[];
}

const PLUGIN_NAME = "MockInputExamplePlugin";

/**
 * A Plugin to create drag & drop mock data inside the example app and tests.
 */
class MockInputExamplePlugin extends Plugin {
  static readonly pluginName: string = PLUGIN_NAME;

  init(): void {
    const initInformation = reportInitStart(this);
    reportInitEnd(initInformation);
  }

  createInsertElement(data: InputExampleElement): HTMLDivElement {
    const insertDiv = document.createElement("div");
    insertDiv.classList.add("input-example", ...(data.classes || []));
    insertDiv.draggable = true;
    insertDiv.textContent = data.label || "Unset";
    insertDiv.dataset.cmuripath = MockInputExamplePlugin.#generateUriPathCsv(data.items || []);
    insertDiv.title = `${data.tooltip} (${insertDiv.dataset.cmuripath})`;
    insertDiv.addEventListener("dragstart", MockInputExamplePlugin.#setDragData);
    insertDiv.addEventListener("dblclick", MockInputExamplePlugin.#setClipboardData);
    insertDiv.addEventListener("dragend", MockInputExamplePlugin.#removeDropData);
    return insertDiv;
  }

  /**
   * Fills the caches for the drag and drop.
   *
   * While the "dragover" event is executed synchronously, we have
   * an asynchronous service-agent call to calculate the drop allowed.
   *
   * To ensure in tests that the drop is allowed, the cache can be filled before
   * executing the drop.
   *
   * @param contentIds - the ids to fill the cache for.
   */
  prefillCaches(contentIds: number[]): boolean {
    const uriPaths = contentIds.map((contentId) => contentUriPath(contentId));
    return uriPaths.every((uriPath) => DragDropAsyncSupport.isLinkable(uriPath));
  }

  static async #setClipboardData(event: MouseEvent): Promise<void> {
    const target = event.target as HTMLElement;
    const contentIdCommaSeparated = target.getAttribute("data-cmuripath");
    if (!contentIdCommaSeparated) {
      return;
    }
    const contentIds: string[] = contentIdCommaSeparated.split(",");
    const beanReferences = MockInputExamplePlugin.#contentList(...contentIds);
    const cmurilist = JSON.stringify(beanReferences);
    const blob = new Blob([cmurilist], { type: "cm/uri-list" });
    const data: Record<string, Blob> = {};
    data[blob.type] = blob;

    const clipboardService = await serviceAgent.fetchService(createClipboardServiceDescriptor());

    clipboardService.setItems([{ data, options: "copy" }], new Date().getTime());
  }

  /**
   * Set the drag data stored in the attribute data-cmuripath to the
   * `dragEvent.dataTransfer` and to the dragDropService in studio.
   *
   * @param dragEvent the drag event
   */
  static #setDragData(dragEvent: DragEvent): void {
    const dragEventTarget = dragEvent.target as HTMLElement;
    const contentId = dragEventTarget.getAttribute("data-cmuripath");
    if (contentId) {
      const idsArray = contentId.split(",");
      const dragDropService = new MockDragDropService();
      dragDropService.dragData = JSON.stringify(MockInputExamplePlugin.#contentDragData(...idsArray));
      serviceAgent.registerService(dragDropService);
      dragEvent.dataTransfer?.setData("cm/uri-list", JSON.stringify(MockInputExamplePlugin.#contentList(...idsArray)));
      dragEvent.dataTransfer?.setData("text", JSON.stringify(MockInputExamplePlugin.#contentList(...idsArray)));
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

  static #contentList(...ids: string[]): BeanReference[] {
    return ids.map((id) => ({
      $Ref: id,
    }));
  }

  static #contentDragData(...ids: string[]): { contents: { $Ref: string }[] } {
    return {
      contents: MockInputExamplePlugin.#contentList(...ids),
    };
  }

  static #generateUriPath(item: number): string {
    return `content/${item}`;
  }

  static #generateUriPathCsv(items: number[]): string {
    return items.map((item) => MockInputExamplePlugin.#generateUriPath(item)).join(",");
  }
}

export default MockInputExamplePlugin;
