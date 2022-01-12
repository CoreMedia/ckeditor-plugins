import type { ServiceObject } from "@coremedia/service-agent";

/**
 * Service for base Studio work area functionality to be registered with the
 * `serviceAgent`.
 *
 * @see serviceAgent
 */
interface WorkAreaService extends ServiceObject {
  /**
   * Opens entities given by their REST URIs in Studio tabs.
   *
   * @param entities the entities given by their URIs.
   * @param background whether to open the tabs in the background.
   * @param options an optional object containing further method options. It may contain any of the following properties:
   *
   * * **focus:** whether the app in which this method is called shall be focused. This is 'true' by default.
   *
   * @returns the promise indicating success or failure.
   */
  openEntitiesInTabs(entities: Array<unknown>, background?: boolean, options?: unknown): Promise<unknown>;

  /**
   * Determines whether entities given by their REST URIs can be opened in a tab.
   *
   * @param entityUris the entities given by their URIs.
   * @returns the promise holding whether the entities can be opened in a tab
   */
  canBeOpenedInTab(entityUris: Array<unknown>): Promise<unknown>;
}

export default WorkAreaService;
