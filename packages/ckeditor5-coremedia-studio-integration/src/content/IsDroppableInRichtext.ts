import { serviceAgent } from "@coremedia/service-agent";
import LoggerProvider from "@coremedia/ckeditor5-logging/logging/LoggerProvider";
import RichtextConfigurationService from "./RichtextConfigurationService";
import { createRichtextConfigurationServiceDescriptor } from "./RichtextConfigurationServiceDescriptor";
import { receiveDraggedItemsFromService } from "./studioservices/DragDropServiceWrapper";

export type IsDroppableEvaluationResult = { uris: string[] | undefined; isDroppable: boolean } | "PENDING";

const logger = LoggerProvider.getLogger("IsDroppableInRichtext");
let pendingEvaluation: { key: string; value: IsDroppableEvaluationResult } | undefined;

/**
 * Returns the evaluation result for isDroppable calls.
 *
 * @param uris - the uris to look up the evaluation result for.
 * @returns the evaluation result or undefined
 */
export const getEvaluationResult = (uris: string[]): IsDroppableEvaluationResult | undefined => {
  if (pendingEvaluation?.key === JSON.stringify(uris)) {
    return pendingEvaluation.value;
  }
  return undefined;
};

/**
 * Reads the currently dragged items from the DragDropService and triggers an
 * asynchronous evaluation if the dragged items are droppable in rich text.
 *
 * While the evaluation requires asynchronous service calls, this method is
 * synchronous and made for cases where the environment is not made for
 * asynchronous behavior (e.g. dragover is always evaluated synchronous)
 *
 * The synchronicity is based on multiple calls. Internally the first call triggers
 * an asynchronous call. Every following one for the same data is returning the state
 * of the call (PENDING or the result).
 *
 * @returns the evaluation result or undefined
 */
export const isDroppable = (): IsDroppableEvaluationResult | undefined => {
  const uris: string[] | undefined = receiveDraggedItemsFromService();
  if (!uris) {
    logger.debug("No uris available, nothing to drop.");
    logger.debug("Current evaluation state", pendingEvaluation);
    return undefined;
  }
  return isDroppableUris(uris);
};

/**
 * Triggers an asynchronous evaluation if the given uris are droppable
 * in rich text.
 *
 * While the evaluation requires asynchronous service calls, this method is
 * synchronous and made for cases where the environment is not made for
 * asynchronous behavior (e.g. dragover is always evaluated synchronous)
 *
 * The synchronicity is based on multiple calls. Internally the first call triggers
 * an asynchronous call. Every following one for the same data is returning the state
 * of the call (PENDING or the result).
 *
 * @returns the evaluation result or undefined
 */
export const isDroppableUris = (uris: string[]): IsDroppableEvaluationResult | undefined => {
  const urisKey = JSON.stringify(uris);

  if (pendingEvaluation?.key === urisKey) {
    logger.debug("Current evaluation state", uris, pendingEvaluation.value);
    return pendingEvaluation.value;
  }

  logger.debug("Starting evaluation of IsDroppableInRichText for dragged contents", uris);

  pendingEvaluation = { key: urisKey, value: "PENDING" };

  evaluateIsDroppable(uris)
    .then((isDroppable) => {
      pendingEvaluation = { key: urisKey, value: isDroppable };
    })
    .catch((reason) => {
      logger.warn("An error occurred while evaluating the droppable state", uris, reason);
      pendingEvaluation = undefined;
    });
  logger.debug("Current evaluation result for contents", pendingEvaluation.value);
  return pendingEvaluation.value;
};

const evaluateIsDroppable = async (uris: string[]): Promise<IsDroppableEvaluationResult> => {
  if (uris.length === 0) {
    return { uris, isDroppable: false };
  }

  const droppableUriInformation = await Promise.all(uris.map((uri) => isDroppableUriInformation(uri)));
  const isDroppable = droppableUriInformation.every(
    (droppableInformation) => droppableInformation.isEmbeddable || droppableInformation.isLinkable
  );
  return Promise.resolve({ uris, isDroppable });
};

const isDroppableUriInformation = async (uri: string): Promise<DroppableUriInformation> => {
  const richTextConfigurationService: RichtextConfigurationService = await serviceAgent.fetchService(
    createRichtextConfigurationServiceDescriptor()
  );
  const isEmbeddable: boolean = await richTextConfigurationService.isEmbeddableType(uri);
  const isLinkable: boolean = await richTextConfigurationService.hasLinkableType(uri);
  return { isEmbeddable, isLinkable };
};

interface DroppableUriInformation {
  isLinkable: boolean;
  isEmbeddable: boolean;
}
