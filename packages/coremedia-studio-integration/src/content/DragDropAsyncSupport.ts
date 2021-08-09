import { serviceAgent } from "@coremedia/studio-apps-service-agent";
import RichtextConfigurationService from "./RichtextConfigurationService";

const IN_PROGRESS = "IN_PROGRESS";
type IS_LINKABLE_RESPONSE = boolean | "IN_PROGRESS";

export default class DragDropAsyncSupport {
  static #isLinkableMap: Map<string, IS_LINKABLE_RESPONSE> = new Map<string, IS_LINKABLE_RESPONSE>();

  /**
   * Workaround for the HTML 5 behaviour that drag over is always synchronous but we have to call an asynchronous service.
   *
   * When the method is called the first time for an URI Path, the method calls the asynchronous RichtextConfigurationService
   * and stores the actual state of the call in a map and returns probably false because the service call is probably still in progress.
   *
   * When the method is called next time the service call might have been returned and the result is true if the given uri path is a linkable, false otherwise.
   *
   * On drop the map has to be cleared so the map does not grow eternally.
   *
   * @param uriPath the uri path of the content.
   */
  static isLinkable(uriPath: string): boolean {
    const actualValue = DragDropAsyncSupport.#isLinkableMap.get(uriPath);
    if (actualValue !== undefined && actualValue === IN_PROGRESS) {
      return false;
    }

    if (actualValue !== undefined) {
      return actualValue;
    }

    DragDropAsyncSupport.#isLinkableMap.set(uriPath, IN_PROGRESS);
    const service = serviceAgent.getService<RichtextConfigurationService>("richtextConfigurationService");
    if (!service) {
      return false;
    }
    service.hasLinkableType(uriPath).then((isLinkable: boolean) => {
      DragDropAsyncSupport.#isLinkableMap.set(uriPath, isLinkable);
    });
    const isLinkable = DragDropAsyncSupport.#isLinkableMap.get(uriPath);
    return isLinkable === undefined || isLinkable === IN_PROGRESS ? false : isLinkable;
  }

  /**
   * Resets the isLinkableMap. Called to prevent eternal grow of the Map.
   */
  static resetIsLinkableMap(): void {
    DragDropAsyncSupport.#isLinkableMap = new Map<string, boolean>();
  }
}
