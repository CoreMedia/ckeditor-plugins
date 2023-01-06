import { serviceAgent } from "@coremedia/service-agent";
import LoggerProvider from "@coremedia/ckeditor5-logging/logging/LoggerProvider";
import {
  BeanReferenceToUriService,
  createBeanReferenceToUriServiceDescriptor,
} from "@coremedia/ckeditor5-coremedia-studio-integration/content/BeanReferenceToUriService";
import RichtextConfigurationService from "@coremedia/ckeditor5-coremedia-studio-integration/content/RichtextConfigurationService";
import { createRichtextConfigurationServiceDescriptor } from "@coremedia/ckeditor5-coremedia-studio-integration/content/RichtextConfigurationServiceDescriptor";
import { receiveDraggedItems } from "@coremedia/ckeditor5-coremedia-studio-integration/content/studioservices/DragDropServiceWrapper";

export type IsLinkableEvaluationResult = { uris: string[] | undefined; isLinkable: boolean } | "PENDING";

const logger = LoggerProvider.getLogger("IsLinkableDragAndDrop");
let pendingEvaluation: { key: string; value: IsLinkableEvaluationResult } | undefined;

/**
 * Returns the evaluation result for isLinkable calls.
 *
 * @param beanReferences - the beanReferences to look up the evaluation result for.
 * @returns the evaluation result or undefined
 */
export const getEvaluationResult = (beanReferences: string): IsLinkableEvaluationResult | undefined => {
  if (pendingEvaluation?.key === beanReferences) {
    return pendingEvaluation.value;
  }
  return undefined;
};

/**
 * Reads the currently dragged items from the DragDropService and triggers an
 * asynchronous evaluation if the dragged items are linkable.
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
export const isLinkable = (): IsLinkableEvaluationResult | undefined => {
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

const evaluateIsLinkable = async (beanReferences: string): Promise<IsLinkableEvaluationResult> => {
  const beanReferenceToUriService: BeanReferenceToUriService =
    await serviceAgent.fetchService<BeanReferenceToUriService>(createBeanReferenceToUriServiceDescriptor());

  const uris: string[] = await beanReferenceToUriService.resolveUris(beanReferences);
  if (uris.length === 0) {
    return Promise.resolve({ uris, isLinkable: false });
  }
  const linkableInformation: boolean[] = await Promise.all(uris.map(isLinkableUriInformation));
  const isLinkable: boolean = linkableInformation.every((value: boolean) => value);
  return Promise.resolve({ uris, isLinkable });
};

const isLinkableUriInformation = async (uri: string): Promise<boolean> => {
  const richTextConfigurationService: RichtextConfigurationService = await serviceAgent.fetchService(
    createRichtextConfigurationServiceDescriptor()
  );
  return richTextConfigurationService.hasLinkableType(uri);
};
