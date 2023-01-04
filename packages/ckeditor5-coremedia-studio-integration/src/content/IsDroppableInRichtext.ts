import { serviceAgent } from "@coremedia/service-agent";
import LoggerProvider from "@coremedia/ckeditor5-logging/logging/LoggerProvider";
import { BeanReferenceToUriService, createBeanReferenceToUriServiceDescriptor } from "./BeanReferenceToUriService";
import RichtextConfigurationService from "./RichtextConfigurationService";
import { createRichtextConfigurationServiceDescriptor } from "./RichtextConfigurationServiceDescriptor";
import { receiveDraggedItems } from "./studioservices/DragDropServiceWrapper";

export type IsDroppableResponse = { uris: string[] | undefined; areDroppable: boolean } | "PENDING";

interface DroppableUriInformation {
  isLinkable: boolean;
  isEmbeddable: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class IsDroppableInRichtext {
  static #logger = LoggerProvider.getLogger(IsDroppableInRichtext.name);
  static #pendingEvaluation: { key: string; value: IsDroppableResponse } | undefined;

  static getEvaluationResult(beanReferences: string): IsDroppableResponse | undefined {
    if (IsDroppableInRichtext.#pendingEvaluation?.key === beanReferences) {
      return IsDroppableInRichtext.#pendingEvaluation.value;
    }
    return undefined;
  }

  static isDroppableBeanReferences(beanReferences: string): IsDroppableResponse | undefined {
    const logger = IsDroppableInRichtext.#logger;
    if (IsDroppableInRichtext.#pendingEvaluation?.key === beanReferences) {
      logger.debug("Current evaluation state", beanReferences, IsDroppableInRichtext.#pendingEvaluation.value);
      return IsDroppableInRichtext.#pendingEvaluation.value;
    }

    logger.debug("Starting evaluation of IsDroppableInRichText for dragged contents", beanReferences);

    IsDroppableInRichtext.#pendingEvaluation = { key: beanReferences, value: "PENDING" };

    this.#evaluateIsDroppable(beanReferences)
      .then((isDroppable) => {
        IsDroppableInRichtext.#pendingEvaluation = { key: beanReferences, value: isDroppable };
      })
      .catch((reason) => {
        logger.warn("An error occurred while evaluating the droppable state", beanReferences, reason);
        IsDroppableInRichtext.#pendingEvaluation = undefined;
      });
    logger.debug("Current evaluation result for contents", IsDroppableInRichtext.#pendingEvaluation.value);
    return IsDroppableInRichtext.#pendingEvaluation.value;
  }

  //TODO: Shape signature and find good names
  static isDroppable(): IsDroppableResponse | undefined {
    const logger = IsDroppableInRichtext.#logger;
    const dragData: string | undefined = receiveDraggedItems();
    if (!dragData) {
      logger.debug("No drag data available, nothing to drop.");
      logger.debug("Current evaluation state", this.#pendingEvaluation);
      return undefined;
    }
    return IsDroppableInRichtext.isDroppableBeanReferences(dragData);
  }

  static async #evaluateIsDroppable(beanReferences: string): Promise<IsDroppableResponse> {
    const beanReferenceToUriService: BeanReferenceToUriService =
      await serviceAgent.fetchService<BeanReferenceToUriService>(createBeanReferenceToUriServiceDescriptor());

    const uris: string[] = await beanReferenceToUriService.resolveUris(beanReferences);
    if (uris.length === 0) {
      return { uris, areDroppable: false };
    }

    const droppableUriInformation = await Promise.all(uris.map((uri) => this.#isDroppableUriInformation(uri)));
    const areDroppable = droppableUriInformation.every(
      (droppableInformation) => droppableInformation.isEmbeddable || droppableInformation.isLinkable
    );
    return Promise.resolve({ uris, areDroppable });
  }

  static async #isDroppableUriInformation(uri: string): Promise<DroppableUriInformation> {
    const richTextConfigurationService: RichtextConfigurationService = await serviceAgent.fetchService(
      createRichtextConfigurationServiceDescriptor()
    );
    const isEmbeddable: boolean = await richTextConfigurationService.isEmbeddableType(uri);
    const isLinkable: boolean = await richTextConfigurationService.hasLinkableType(uri);
    return { isEmbeddable, isLinkable };
  }
}
