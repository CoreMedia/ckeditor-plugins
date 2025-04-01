/**
 * This module provides extension points, which needs to be implemented for
 * integration into CoreMedia Studio.
 *
 * @module ckeditor5-coremedia-studio-integration
 */
export { default as BlobDisplayService, InlinePreview } from "./content/BlobDisplayService";
export { createBlobDisplayServiceDescriptor } from "./content/BlobDisplayServiceDescriptor";

export { default as ContentDisplayService } from "./content/ContentDisplayService";
export { createContentDisplayServiceDescriptor } from "./content/ContentDisplayServiceDescriptor";

export { default as ContentSearchService } from "./content/ContentSearchService";
export { createContentSearchServiceDescriptor } from "./content/ContentSearchServiceDescriptor";

export {
  CollectionViewService,
  createCollectionViewServiceDescriptor,
  CollectionViewServiceProps,
} from "./content/studioservices/CollectionViewService";

export { default as RichtextConfigurationService } from "./content/RichtextConfigurationService";
export { createRichtextConfigurationServiceDescriptor } from "./content/RichtextConfigurationServiceDescriptor";

export { default as BlocklistService } from "./BlocklistService";
export { createBlocklistServiceDescriptor } from "./BlocklistServiceDescriptor";

// Helpers
export type { UriPath, ModelUri } from "./content/UriPath";
export { isUriPath, contentUriPath, numericId, CONTENT_CKE_MODEL_URI_REGEXP } from "./content/UriPath";
export { isModelUriPath, requireContentUriPath, requireContentCkeModelUri } from "./content/UriPath";

export { default as ContentAsLink } from "./content/ContentAsLink";
export { default as DisplayHint } from "./content/DisplayHint";

export { default as ClipboardService } from "./content/studioservices/ClipboardService";
export { createClipboardServiceDescriptor } from "./content/ClipboardServiceDesriptor";

export { default as ClipboardItemRepresentation } from "./content/studioservices/ClipboardItemRepresentation";

export {
  ContentReferenceResponse,
  createContentReferenceServiceDescriptor,
} from "./content/studioservices/IContentReferenceService";

export {
  getEvaluationResult,
  getOrEvaluateIsDroppableResult,
  isDroppable,
  isDroppableUris,
  IsDroppableEvaluationResult,
} from "./content/IsDroppableInRichtext";

export { receiveDraggedItemsFromDataTransfer } from "./content/studioservices/DragDropServiceWrapper";
export { default as DragDropService } from "./content/studioservices/DragDropService";

export {
  ContentImportService,
  createContentImportServiceDescriptor,
} from "./content/studioservices/ContentImportService";

export { createWorkAreaServiceDescriptor } from "./content/WorkAreaServiceDescriptor";
export { default as WorkAreaService } from "./content/studioservices/WorkAreaService";

export { IsLinkableEvaluationResult, isLinkableUris, isLinkable } from "./content/IsLinkableDragAndDrop";

export { ROOT_NAME } from "./content/Constants";

export { toContentUris } from "./content/studioservices/ClipboardServiceUtil";

export { ExternalUriInformation, IContentReferenceService } from "./content/studioservices/IContentReferenceService";
