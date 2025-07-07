import { LoggerProvider } from "@coremedia/ckeditor5-logging";
import { serviceAgent } from "@coremedia/service-agent";
import { createContentFormServiceDescriptor } from "@coremedia/ckeditor5-coremedia-studio-integration";

const logger = LoggerProvider.getLogger("OpenInTab");

/**
 * Retrieve the content form service.
 */
const fetchContentFormService = () => serviceAgent.fetchService(createContentFormServiceDescriptor());

/**
 * Result provided by `ContentFormService.openEntitiesInTabs`.
 */
export interface OpenEntityInTabResult {
  accepted: string[];
  rejected: string[];
}

/**
 * Queries, if the provided URI path can be opened in tab.
 *
 * @param uriPath - URI path to validate
 */
export const canBeOpenedInTab = async (uriPath: string): Promise<boolean> =>
  fetchContentFormService().then(
    (contentFormService): Promise<boolean> =>
      contentFormService.canBeOpened(uriPath).catch((error): boolean => {
        logger.debug(`Failed to query "canBeOpenedInTab" for ${uriPath}. Default to false.`, error);
        return false;
      }),
  );

/**
 * Open the given entity in content form.
 *
 * @param uriPath - URI path to open
 */
export const openEntityInTab = async (uriPath: string): Promise<OpenEntityInTabResult> => {
  logger.debug(`Triggered to open in tab: ${uriPath}`);
  return fetchContentFormService().then(
    (contentFormService): Promise<OpenEntityInTabResult> =>
      contentFormService.openContentForm(uriPath, { additionalOptions: { focusTab: true } }),
  );
};
