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

const logger = LoggerProvider.getLogger("IsDroppableInRichtext");
let pendingEvaluation: { key: string; value: IsDroppableResponse } | undefined;

export const getEvaluationResult = (beanReferences: string): IsDroppableResponse | undefined => {
  if (pendingEvaluation?.key === beanReferences) {
    return pendingEvaluation.value;
  }
  return undefined;
};

export const isDroppableBeanReferences = (beanReferences: string): IsDroppableResponse | undefined => {
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

//TODO: Shape signature and find good names
export const isDroppable = (): IsDroppableResponse | undefined => {
  const dragData: string | undefined = receiveDraggedItems();
  if (!dragData) {
    logger.debug("No drag data available, nothing to drop.");
    logger.debug("Current evaluation state", pendingEvaluation);
    return undefined;
  }
  return isDroppableBeanReferences(dragData);
};

const evaluateIsDroppable = async (beanReferences: string): Promise<IsDroppableResponse> => {
  const beanReferenceToUriService: BeanReferenceToUriService =
    await serviceAgent.fetchService<BeanReferenceToUriService>(createBeanReferenceToUriServiceDescriptor());

  const uris: string[] = await beanReferenceToUriService.resolveUris(beanReferences);
  if (uris.length === 0) {
    return { uris, areDroppable: false };
  }

  const droppableUriInformation = await Promise.all(uris.map((uri) => isDroppableUriInformation(uri)));
  const areDroppable = droppableUriInformation.every(
    (droppableInformation) => droppableInformation.isEmbeddable || droppableInformation.isLinkable
  );
  return Promise.resolve({ uris, areDroppable });
};

const isDroppableUriInformation = async (uri: string): Promise<DroppableUriInformation> => {
  const richTextConfigurationService: RichtextConfigurationService = await serviceAgent.fetchService(
    createRichtextConfigurationServiceDescriptor()
  );
  const isEmbeddable: boolean = await richTextConfigurationService.isEmbeddableType(uri);
  const isLinkable: boolean = await richTextConfigurationService.hasLinkableType(uri);
  return { isEmbeddable, isLinkable };
};
