import { LoggerProvider } from "@coremedia/ckeditor5-logging";
import { serviceAgent } from "@coremedia/service-agent";
import { createWorkAreaServiceDescriptor } from "@coremedia/ckeditor5-coremedia-studio-integration";

const logger = LoggerProvider.getLogger("OpenInTab");

/**
 * Retrieve the workarea service.
 */
const fetchWorkAreaService = () => serviceAgent.fetchService(createWorkAreaServiceDescriptor());

/**
 * Result provided by `WorkAreaService.openEntitiesInTabs`.
 */
export interface OpenEntitiesInTabsResult {
  accepted: string[];
  rejected: string[];
}

/**
 * Empty response from `WorkAreaService.openEntitiesInTabs`.
 */
export const emptyOpenEntitiesInTabsResult: OpenEntitiesInTabsResult = {
  accepted: [],
  rejected: [],
};

/**
 * Queries, if all provided URI paths can be opened in tab.
 *
 * @param uriPaths - URI paths to validate
 */
export const canAllBeOpenedInTab = async (...uriPaths: string[]): Promise<boolean> => {
  if (uriPaths.length === 0) {
    return false;
  }

  return fetchWorkAreaService().then(
    (workAreaService): Promise<boolean> =>
      workAreaService.canBeOpenedInTab(uriPaths).catch((error): boolean => {
        logger.debug(`Failed to query "canBeOpenedInTab" for ${uriPaths}. Default to false.`, error);
        return false;
      }),
  );
};

/**
 * Queries, if the provided URI path can be opened in tab.
 *
 * @param uriPath - URI path to validate
 */
export const canBeOpenedInTab = (uriPath: string): Promise<boolean> => canAllBeOpenedInTab(uriPath);

/**
 * Open the given entities in tabs.
 *
 * @param uriPaths - URI paths to open
 */
export const openEntitiesInTabs = async (...uriPaths: string[]): Promise<OpenEntitiesInTabsResult> => {
  logger.debug(`Triggered to open in tab (${uriPaths.length}): ${uriPaths}`);
  if (uriPaths.length === 0) {
    return emptyOpenEntitiesInTabsResult;
  }
  return fetchWorkAreaService().then(
    (workAreaService): Promise<OpenEntitiesInTabsResult> =>
      workAreaService.openEntitiesInTabs(uriPaths, false, {
        additionalOptions: {
          focusTab: true,
        },
      }),
  );
};
