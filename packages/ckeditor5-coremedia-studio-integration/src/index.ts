/**
 * This module provides extension points, which needs to be implemented for
 * integration into CoreMedia Studio.
 *
 * @module ckeditor5-coremedia-studio-integration
 */
export type { default as BlobDisplayService, InlinePreview } from "./content/BlobDisplayService";
export { createBlobDisplayServiceDescriptor } from "./content/BlobDisplayServiceDescriptor";

export type { default as ContentDisplayService } from "./content/ContentDisplayService";
export { createContentDisplayServiceDescriptor } from "./content/ContentDisplayServiceDescriptor";

export type { ContentSearchService } from "./content/ContentSearchService";
export { createContentSearchServiceDescriptor } from "./content/ContentSearchServiceDescriptor";

export type { CollectionViewLinkService, LinkSearchState } from "./content/CollectionViewLinkService";
export { createCollectionViewLinkServiceDescriptor } from "./content/CollectionViewLinkServiceDescriptor";

export type { default as RichtextConfigurationService } from "./content/RichtextConfigurationService";
export { createRichtextConfigurationServiceDescriptor } from "./content/RichtextConfigurationServiceDescriptor";

export type { default as BlocklistService } from "./BlocklistService";
export { createBlocklistServiceDescriptor } from "./BlocklistServiceDescriptor";

// Helpers
export type { UriPath, ModelUri } from "./content/UriPath";
export { isUriPath, contentUriPath, numericId, CONTENT_CKE_MODEL_URI_REGEXP } from "./content/UriPath";
export { isModelUriPath, requireContentUriPath, requireContentCkeModelUri } from "./content/UriPath";

export type { default as ContentAsLink } from "./content/ContentAsLink";
export type { default as DisplayHint } from "./content/DisplayHint";

export { default as ClipboardService } from "./content/studioservices/ClipboardService";
export { createClipboardServiceDescriptor } from "./content/ClipboardServiceDesriptor";

export type { default as ClipboardItemRepresentation } from "./content/studioservices/ClipboardItemRepresentation";

export type { ContentReferenceResponse } from "./content/studioservices/IContentReferenceService";
export { createContentReferenceServiceDescriptor } from "./content/studioservices/IContentReferenceService";

export type { IsDroppableEvaluationResult } from "./content/IsDroppableInRichtext";
export {
  getEvaluationResult,
  getOrEvaluateIsDroppableResult,
  isDroppable,
  isDroppableUris,
} from "./content/IsDroppableInRichtext";

export {
  receiveDraggedItemsFromDataTransfer,
  receiveDraggedItemsFromService,
} from "./content/studioservices/DragDropServiceWrapper";
export type { default as DragDropService } from "./content/studioservices/DragDropService";

export {
  ContentImportService,
  createContentImportServiceDescriptor,
} from "./content/studioservices/ContentImportService";

export { createContentFormServiceDescriptor } from "./content/ContentFormServiceDescriptor";
export type { default as ContentFormService } from "./content/studioservices/ContentFormService";

export type { IsLinkableEvaluationResult } from "./content/IsLinkableDragAndDrop";
export { isLinkableUris, isLinkable } from "./content/IsLinkableDragAndDrop";

export { ROOT_NAME } from "./content/Constants";

export { toContentUris } from "./content/studioservices/ClipboardServiceUtil";

export type {
  ExternalUriInformation,
  IContentReferenceService,
} from "./content/studioservices/IContentReferenceService";

export { COREMEDIA_CONTEXT_KEY } from "./content/Constants";
