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

export { default as RichtextConfigurationService } from "./content/RichtextConfigurationService";
export { createRichtextConfigurationServiceDescriptor } from "./content/RichtextConfigurationServiceDescriptor";

export { default as BlocklistService } from "./BlocklistService";
export { createBlocklistServiceDescriptor } from "./BlocklistServiceDescriptor";

// Helpers
export type { UriPath } from "./content/UriPath";
export { isModelUriPath, requireContentUriPath } from "./content/UriPath";

export { default as ContentAsLink } from "./content/ContentAsLink";
export { default as DisplayHint } from "./content/DisplayHint";
