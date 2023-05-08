/**
 * Service for base Studio work area functionality to be registered with the
 * `serviceAgent`.
 *
 * @see serviceAgent
 */
import { Observable } from "rxjs";

interface WorkAreaService {
  /**
   * Opens entities given by their REST URIs in Studio tabs.
   *
   * @param entities - the entities given by their URIs.
   * @param background - whether to open the tabs in the background.
   * @param options - an optional object containing further method options. It may contain any of the following properties:
   *
   * * **focus:** whether the app in which this method is called shall be focused. This is 'true' by default.
   *
   * @returns the promise indicating success or failure.
   */
  openEntitiesInTabs(
    entities: unknown[],
    background?: boolean,
    options?: unknown
  ): Promise<{ accepted: string[]; rejected: string[] }>;

  /**
   * Determines whether entities given by their REST URIs can be opened in a tab.
   *
   * @param entityUris - the entities given by their URIs.
   * @returns the promise holding whether the entities can be opened in a tab
   */
  canBeOpenedInTab(entityUris: unknown[]): Promise<boolean>;

  /**
   * Observes the currently active work area entity.
   *
   * If the entity is a {@link RemoteBean}, its URI path is returned. Otherwise, the
   * whole entity is returned.
   *
   * @returns the observable for the active entity.
   */
  observe_activeEntity(): Observable<unknown>;
}

export default WorkAreaService;
