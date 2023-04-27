import { serviceAgent } from "@coremedia/service-agent";
import LoggerProvider from "@coremedia/ckeditor5-logging/src/logging/LoggerProvider";
import { receiveDraggedItemsFromService } from "./studioservices/DragDropServiceWrapper";
import RichtextConfigurationService from "./RichtextConfigurationService";
import { createRichtextConfigurationServiceDescriptor } from "./RichtextConfigurationServiceDescriptor";

export type IsLinkableEvaluationResult = { uris: string[] | undefined; isLinkable: boolean } | "PENDING";

const logger = LoggerProvider.getLogger("IsLinkableDragAndDrop");
let pendingEvaluation: { key: string; value: IsLinkableEvaluationResult } | undefined;

/**
 * Returns the evaluation result for isLinkable calls.
 *
 * @param uris - the uris to look up the evaluation result for.
 * @returns the evaluation result or undefined
 */
export const getEvaluationResult = (uris: string[]): IsLinkableEvaluationResult | undefined => {
  if (pendingEvaluation?.key === JSON.stringify(uris)) {
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
export const isLinkableUris = (uris: string[]): IsLinkableEvaluationResult | undefined => {
  const urisKey = JSON.stringify(uris);

  if (pendingEvaluation?.key === urisKey) {
    return pendingEvaluation.value;
  }

  pendingEvaluation = { key: urisKey, value: "PENDING" };
  evaluateIsLinkable(uris)
    .then((isDroppable) => {
      pendingEvaluation = { key: urisKey, value: isDroppable };
    })
    .catch((reason: string) => {
      logger.warn("An error occurred while evaluating the droppable state", uris, reason);
      pendingEvaluation = undefined;
    });
  return pendingEvaluation.value;
};

export const isLinkable = (): IsLinkableEvaluationResult | undefined => {
  const dragData: string[] | undefined = receiveDraggedItemsFromService();
  if (!dragData) {
    logger.info("No drag data available, nothing to drop. Enable debug logging if you are facing any problems.");
    return undefined;
  }

  return isLinkableUris(dragData);
};

const evaluateIsLinkable = async (uris: string[]): Promise<IsLinkableEvaluationResult> => {
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
