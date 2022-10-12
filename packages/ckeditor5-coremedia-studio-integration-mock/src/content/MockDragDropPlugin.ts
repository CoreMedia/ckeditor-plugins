import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import { reportInitEnd, reportInitStart } from "@coremedia/ckeditor5-core-common/Plugins";
import { serviceAgent } from "@coremedia/service-agent";
import MockDragDropService from "./MockDragDropService";
import DragDropAsyncSupport from "@coremedia/ckeditor5-coremedia-studio-integration/content/DragDropAsyncSupport";
import { contentUriPath } from "@coremedia/ckeditor5-coremedia-studio-integration/content/UriPath";

/**
 * Describes a div-element which can be created by this plugin.
 * An DroppableElement contains all data which are necessary to make the created
 * div-element drag & drop ready.
 */
export interface DroppableElement {
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
   * content ids to create the drag information for studio from.
   */
  items: number[];
}

const PLUGIN_NAME = "MockDragDrop";

/**
 * A Plugin to create drag & drop mock data inside the example app and tests.
 */
class MockDragDropPlugin extends Plugin {
  static readonly pluginName: string = PLUGIN_NAME;

  init(): Promise<void> | void {
    const initInformation = reportInitStart(this);
    reportInitEnd(initInformation);
  }

  createDragDivElement(data: DroppableElement): HTMLDivElement {
    const dragDiv = document.createElement("div");
    dragDiv.classList.add("drag-example", ...(data.classes || []));
    dragDiv.draggable = true;
    dragDiv.textContent = data.label || "Unset";
    dragDiv.dataset.cmuripath = MockDragDropPlugin.#generateUriPathCsv(data.items || []);
    dragDiv.title = data.tooltip + " (" + dragDiv.dataset.cmuripath + ")";
    dragDiv.addEventListener("dragstart", MockDragDropPlugin.#setDragData);
    dragDiv.addEventListener("dragend", MockDragDropPlugin.#removeDropData);
    return dragDiv;
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
    return uriPaths.every((uriPath) => {
      return DragDropAsyncSupport.isLinkable(uriPath);
    });
  }

  /**
   * Set the drag data stored in the attribute data-cmuripath to the dragEvent.dataTransfer and to the dragDropService in studio.
   *
   * @param dragEvent the drag event
   */
  static #setDragData(dragEvent: DragEvent) {
    const dragEventTarget = dragEvent.target as HTMLElement;
    const contentId = dragEventTarget.getAttribute("data-cmuripath");
    if (contentId) {
      const idsArray = contentId.split(",");
      const dragDropService = new MockDragDropService();
      dragDropService.dragData = JSON.stringify(MockDragDropPlugin.#contentDragData(...idsArray));
      serviceAgent.registerService(dragDropService);
      dragEvent.dataTransfer?.setData("cm/uri-list", JSON.stringify(MockDragDropPlugin.#contentList(...idsArray)));
      dragEvent.dataTransfer?.setData("text", JSON.stringify(MockDragDropPlugin.#contentList(...idsArray)));
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

  static #contentList(...ids: string[]): { $Ref: string }[] {
    return ids.map((id) => {
      return {
        $Ref: id,
      };
    });
  }

  static #contentDragData(...ids: string[]): { contents: { $Ref: string }[] } {
    return {
      contents: MockDragDropPlugin.#contentList(...ids),
    };
  }

  static #generateUriPath(item: number): string {
    return `content/${item}`;
  }

  static #generateUriPathCsv(items: number[]): string {
    return items.map((item) => MockDragDropPlugin.#generateUriPath(item)).join(",");
  }
}

export default MockDragDropPlugin;
