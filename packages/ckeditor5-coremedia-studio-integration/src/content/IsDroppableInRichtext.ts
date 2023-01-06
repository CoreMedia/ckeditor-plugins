import { serviceAgent } from "@coremedia/service-agent";
import LoggerProvider from "@coremedia/ckeditor5-logging/logging/LoggerProvider";
import { BeanReferenceToUriService, createBeanReferenceToUriServiceDescriptor } from "./BeanReferenceToUriService";
import RichtextConfigurationService from "./RichtextConfigurationService";
import { createRichtextConfigurationServiceDescriptor } from "./RichtextConfigurationServiceDescriptor";
import { receiveDraggedItems } from "./studioservices/DragDropServiceWrapper";

export type IsDroppableEvaluationResult = { uris: string[] | undefined; isDroppable: boolean } | "PENDING";

const logger = LoggerProvider.getLogger("IsDroppableInRichtext");
let pendingEvaluation: { key: string; value: IsDroppableEvaluationResult } | undefined;

/**
 * Returns the evaluation result for isDroppable calls.
 *
 * @param beanReferences - the beanReferences to look up the evaluation result for.
 * @returns the evaluation result or undefined
 */
export const getEvaluationResult = (beanReferences: string): IsDroppableEvaluationResult | undefined => {
  if (pendingEvaluation?.key === beanReferences) {
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
  const dragData: string | undefined = receiveDraggedItems();
  if (!dragData) {
    logger.debug("No drag data available, nothing to drop.");
    logger.debug("Current evaluation state", pendingEvaluation);
    return undefined;
  }
  return isDroppableBeanReferences(dragData);
};

/**
 * Triggers an asynchronous evaluation if the given bean references are droppable
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
export const isDroppableBeanReferences = (beanReferences: string): IsDroppableEvaluationResult | undefined => {
  if (pendingEvaluation?.key === beanReferences) {
    logger.debug("Current evaluation state", beanReferences, pendingEvaluation.value);
    return pendingEvaluation.value;
  }

  logger.debug("Starting evaluation of IsDroppableInRichText for dragged contents", beanReferences);

  pendingEvaluation = { key: beanReferences, value: "PENDING" };

  evaluateIsDroppable(beanReferences)
    .then((isDroppable) => {
      pendingEvaluation = { key: beanReferences, value: isDroppable };
    })
    .catch((reason) => {
      logger.warn("An error occurred while evaluating the droppable state", beanReferences, reason);
      pendingEvaluation = undefined;
    });
  logger.debug("Current evaluation result for contents", pendingEvaluation.value);
  return pendingEvaluation.value;
};

const evaluateIsDroppable = async (beanReferences: string): Promise<IsDroppableEvaluationResult> => {
  const beanReferenceToUriService: BeanReferenceToUriService =
    await serviceAgent.fetchService<BeanReferenceToUriService>(createBeanReferenceToUriServiceDescriptor());

  const uris: string[] = await beanReferenceToUriService.resolveUris(beanReferences);
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
