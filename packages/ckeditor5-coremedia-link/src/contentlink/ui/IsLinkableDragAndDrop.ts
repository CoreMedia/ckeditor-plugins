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

const logger = LoggerProvider.getLogger("IsLinkableDragAndDrop");
let pendingEvaluation: { key: string; value: IsLinkableResponse } | undefined;

export const getEvaluationResult = (beanReferences: string): IsLinkableResponse | undefined => {
  if (pendingEvaluation?.key === beanReferences) {
    return pendingEvaluation.value;
  }
  return undefined;
};

/**
 * Reads the currently dragged items from the DragDropService.
 */
export const isLinkable = (): IsLinkableResponse | undefined => {
  const dragData: string | undefined = receiveDraggedItems();
  if (!dragData) {
    logger.info("No drag data available, nothing to drop. Enable debug logging if you are facing any problems.");
    return undefined;
  }

  if (pendingEvaluation?.key === dragData) {
    return pendingEvaluation.value;
  }

  pendingEvaluation = { key: dragData, value: "PENDING" };
  evaluateIsLinkable(dragData)
    .then((isDroppable) => {
      pendingEvaluation = { key: dragData, value: isDroppable };
    })
    .catch((reason: string) => {
      logger.warn("An error occurred while evaluating the droppable state", dragData, reason);
      pendingEvaluation = undefined;
    });
  return pendingEvaluation.value;
};

const evaluateIsLinkable = async (beanReferences: string): Promise<IsLinkableResponse> => {
  const beanReferenceToUriService: BeanReferenceToUriService =
    await serviceAgent.fetchService<BeanReferenceToUriService>(createBeanReferenceToUriServiceDescriptor());

  const uris: string[] = await beanReferenceToUriService.resolveUris(beanReferences);
  if (uris.length === 0) {
    return Promise.resolve({ uris, areLinkable: false });
  }
  const linkableInformation: boolean[] = await Promise.all(uris.map(isLinkableUriInformation));
  const allLinkable: boolean = linkableInformation.every((value: boolean) => value);
  return Promise.resolve({ uris, areLinkable: allLinkable });
};

const isLinkableUriInformation = async (uri: string): Promise<boolean> => {
  const richTextConfigurationService: RichtextConfigurationService = await serviceAgent.fetchService(
    createRichtextConfigurationServiceDescriptor()
  );
  return richTextConfigurationService.hasLinkableType(uri);
};
