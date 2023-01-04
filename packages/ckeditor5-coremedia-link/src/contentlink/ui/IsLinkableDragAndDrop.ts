import { serviceAgent } from "@coremedia/service-agent";
import LoggerProvider from "@coremedia/ckeditor5-logging/logging/LoggerProvider";
import {
  BeanReferenceToUriService,
  createBeanReferenceToUriServiceDescriptor,
} from "@coremedia/ckeditor5-coremedia-studio-integration/content/BeanReferenceToUriService";
import RichtextConfigurationService from "@coremedia/ckeditor5-coremedia-studio-integration/content/RichtextConfigurationService";
import { createRichtextConfigurationServiceDescriptor } from "@coremedia/ckeditor5-coremedia-studio-integration/content/RichtextConfigurationServiceDescriptor";
import { receiveDraggedItems } from "@coremedia/ckeditor5-coremedia-studio-integration/content/studioservices/DragDropServiceWrapper";

export type IsLinkableResponse = { uris: string[] | undefined; areLinkable: boolean } | "PENDING" | undefined;

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class IsLinkableDragAndDrop {
  static #logger = LoggerProvider.getLogger(IsLinkableDragAndDrop.name);

  static #pendingEvaluation: { key: string; value: IsLinkableResponse } | undefined;

  static getEvaluationResult(beanReferences: string): IsLinkableResponse | undefined {
    if (IsLinkableDragAndDrop.#pendingEvaluation?.key === beanReferences) {
      return IsLinkableDragAndDrop.#pendingEvaluation.value;
    }
    return undefined;
  }

  static isLinkable(): IsLinkableResponse | undefined {
    const dragData: string | undefined = receiveDraggedItems();
    if (!dragData) {
      IsLinkableDragAndDrop.#logger.info(
        "No drag data available, nothing to drop. Enable debug logging if you are facing any problems."
      );
      return undefined;
    }

    if (IsLinkableDragAndDrop.#pendingEvaluation?.key === dragData) {
      return IsLinkableDragAndDrop.#pendingEvaluation.value;
    }

    IsLinkableDragAndDrop.#pendingEvaluation = { key: dragData, value: "PENDING" };
    IsLinkableDragAndDrop.#evaluateIsLinkable(dragData)
      .then((isDroppable) => {
        IsLinkableDragAndDrop.#pendingEvaluation = { key: dragData, value: isDroppable };
      })
      .catch((reason) => {
        IsLinkableDragAndDrop.#logger.warn("An error occurred while evaluating the droppable state", dragData, reason);
        IsLinkableDragAndDrop.#pendingEvaluation = undefined;
      });
    return IsLinkableDragAndDrop.#pendingEvaluation.value;
  }

  static async #evaluateIsLinkable(beanReferences: string): Promise<IsLinkableResponse> {
    const beanReferenceToUriService: BeanReferenceToUriService =
      await serviceAgent.fetchService<BeanReferenceToUriService>(createBeanReferenceToUriServiceDescriptor());

    const uris: string[] = await beanReferenceToUriService.resolveUris(beanReferences);
    if (uris.length === 0) {
      return Promise.resolve({ uris, areLinkable: false });
    }
    const linkableInformation: boolean[] = await Promise.all(uris.map(IsLinkableDragAndDrop.#isLinkableUriInformation));
    const allLinkable: boolean = linkableInformation.every((value: boolean) => value);
    return Promise.resolve({ uris, areLinkable: allLinkable });
  }

  static async #isLinkableUriInformation(uri: string): Promise<boolean> {
    const richTextConfigurationService: RichtextConfigurationService = await serviceAgent.fetchService(
      createRichtextConfigurationServiceDescriptor()
    );
    return richTextConfigurationService.hasLinkableType(uri);
  }
}
