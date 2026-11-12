import type { GetDataApi } from "./DataApi";

/**
 * Save method type.
 */
export type Save = (dataApi: GetDataApi) => Promise<void>;

/**
 * The configuration of the `DataFacade`.
 *
 * ```typescript
 * ClassicEditor
 *   .create(editorElement, {
 *      autosave: {
 *        save( editor: Editor ): Promise<unknown> {
 *          // Typically skipped. Use `dataFacade` instead.
 *        },
 *        // Waiting time configured here, will then forward to `dataFacade`.
 *        waitingTime: 2000,
 *      }
 *   });
 *   .then( ... )
 *   .catch( ... );
 * ```
 */
export interface DataFacadeConfig {
  /**
   * The callback to be executed when the data needs to be saved.
   *
   * This function must return a promise that should be resolved when the data
   * is successfully saved.
   *
   * ```typescript
   * ClassicEditor
   *   .create(editorElement, {
   *     dataFacade: {
   *       save(dataApi: GetDataApi) {
   *         return saveData(dataApi.getData());
   *       },
   *     },
   *   });
   *   .then( ... )
   *   .catch( ... );
   * ```
   */
  save?: Save;
}
