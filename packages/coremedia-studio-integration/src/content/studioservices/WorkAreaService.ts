import { Observable } from "rxjs";
import type { ServiceObject } from "@coremedia/studio-apps-service-agent";

/**
 * Service for base Studio work area functionality to be registered with the
 * {@code serviceAgent}.
 *
 * @see serviceAgent
 */
interface WorkAreaService extends ServiceObject {
  /**
   * Opens entities given by their REST URIs in Studio tabs.
   *
   * @param entityUris the entities given by their URIs.
   * @param background whether to open the tabs in the background.
   * @param options an optional object containing further method options. It may contain any of the following properties:
   * <ul>
   *   <li>focus: whether the app in which this method is called shall be focused. This is 'true' by default.</li>
   * </ul>
   * @return the promise indicating success or failure.
   */
  openEntitiesInTabs(entities: Array<any>, background?: boolean, options?: any): Promise<any>;

  /**
   * Determines whether entities given by their REST URIs can be opened in a tab.
   *
   * @param entityUris the entities given by their URIs.
   * @return the promise holding whether the entities can be opened in a tab
   */
  canBeOpenedInTab(entityUris: Array<any>): Promise<any>;
}

export default WorkAreaService;
