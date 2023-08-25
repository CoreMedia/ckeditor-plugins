import Logger from "@coremedia/ckeditor5-logging/src/logging/Logger";
import LoggerProvider from "@coremedia/ckeditor5-logging/src/logging/LoggerProvider";
import { GetDataOptions, SetDataData, SetDataOptions } from "./DataControllerTypes";
import { LastSetData } from "./LastSetData";
import { CKEditorError } from "@ckeditor/ckeditor5-utils";
import { normalizeData } from "./Data";
import { RawDataAccess } from "./RawDataAccess";
import { dataUnavailable, DataUnavailable, InvalidData } from "./InvalidData";

export enum CachedDataState {
  cacheEmpty = "cacheEmpty",
  cacheNotPropagatedYet = "cacheNotPropagatedYet",
  cacheOutdated = "cacheOutdated",
  cacheUpToDate = "cacheUpToDate",
}

/**
 * This facade is meant to control data in- and output. It ensures that any
 * data set is returned unchanged, unless editorial actions have been performed
 * meanwhile. Thus, it grants that in a control flow set-data directly followed
 * by get-data the retrieved data are strictly equal to the ones set before.
 *
 * **Motivation**: For any control flow set-data and get-data it is perfectly
 * valid that the retrieved data may have subtle differences to the previously
 * set data.
 *
 * Given HTML as data format, the following representations are equivalent
 * regarding the corresponding representation within a browser (unless
 * CSS rules make a difference here):
 *
 * ```html
 * <em><strong id="7fac" class="pretty">Lorem</strong></em>
 * ```
 *
 * ```html
 * <strong class="pretty" id="7fac"><em>Lorem</em></strong>
 * ```
 *
 * Depending on the storage backend, the CKEditor instance is bound to it is
 * possibly important not to signal a change when the change is not relevant. It
 * may cause overhead such as additional network communication, subsequent
 * publication steps or even may trigger translation processes.
 */
export class CachedDataAccess extends RawDataAccess {
  static readonly #logger: Logger = LoggerProvider.getLogger("CachedDataAccess");
  readonly #lastSetData: LastSetData = new LastSetData();
  #active = false;

  /**
   * Activates propagation of cached data to editor.
   * Immediately triggers propagation of any already cached data.
   */
  activate(): void {
    this.#active = true;
  }

  /**
   * Deactivates propagation of cached data to editor.
   */
  deactivate(): void {
    this.#active = false;
  }

  /**
   * Propagates the data to the editor.
   */
  propagateData(): void {
    if (this.#active) {
      this.#lastSetData.propagateData(this.editor);
    }
  }

  override setData(data: SetDataData, options: SetDataOptions = {}): void {
    const logger = CachedDataAccess.#logger;

    const normalizedData = normalizeData(data);
    this.#lastSetData.data = normalizedData;
    this.#lastSetData.options = options;
    logger.debug(`Cached data.`, { data: normalizedData });
    this.propagateData();
  }

  /**
   * Signals the state of the cache.
   */
  get cachedDataState(): CachedDataState {
    const lastSetData = this.#lastSetData;
    const { data } = lastSetData;
    if (data === undefined) {
      return CachedDataState.cacheEmpty;
    }
    if (!lastSetData.propagated) {
      return CachedDataState.cacheNotPropagatedYet;
    }
    if (lastSetData.isCurrent(this.editor)) {
      return CachedDataState.cacheUpToDate;
    }
    return CachedDataState.cacheOutdated;
  }

  /**
   * Gets the data, possibly from cache.
   *
   * @param options - options for retrieving data; note, that despite the
   * `rootName` any other options are ignored if data are retrieved from cache.
   */
  override getData(options: GetDataOptions = {}): string | InvalidData {
    const logger = CachedDataAccess.#logger;

    const state = this.cachedDataState;
    if ([CachedDataState.cacheEmpty, CachedDataState.cacheOutdated].includes(state)) {
      logger.debug(`Retrieving data directly from editor. Cached data state: ${state}`);
      return super.getData(options);
    }

    logger.debug(`Retrieving data from cache. Cached data state: ${state}`);
    return this.getCachedData(options);
  }

  /**
   * Get cached data.
   *
   * @param options - options, required to retrieve the `rootName` from
   * @throws CKEditorError if no data exist for given `rootName` (simulates behavior of `DataController`)
   */
  getCachedData(options: GetDataOptions = {}): string | DataUnavailable {
    const logger = CachedDataAccess.#logger;
    const { data: dataController } = this.editor;
    const lastSetData = this.#lastSetData;
    const { data } = lastSetData;

    if (data === undefined) {
      // Should not happen, as previous code should have forwarded directly
      // to `DataController` then.
      return dataUnavailable;
    }

    const { rootName = "main" } = options;

    if (rootName in data) {
      const selectedData = data[rootName];
      logger.debug("Fallback to last set data.", { data: selectedData });
      return selectedData;
    }

    // We simulate the failure from DataController, as if the requested root
    // does not exist.
    throw new CKEditorError("datacontroller-get-non-existent-root", dataController);
  }
}
