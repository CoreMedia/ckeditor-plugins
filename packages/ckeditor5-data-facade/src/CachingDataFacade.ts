import { EditorReadyEvent, Plugin } from "@ckeditor/ckeditor5-core";
import Logger from "@coremedia/ckeditor5-logging/src/logging/Logger";
import LoggerProvider from "@coremedia/ckeditor5-logging/src/logging/LoggerProvider";
import { reportInitEnd, reportInitStart } from "@coremedia/ckeditor5-core-common";
import { GetDataOptions, SetDataData, SetDataOptions } from "./DataControllerTypes";
import { LastSetData } from "./LastSetData";
import { CKEditorError } from "@ckeditor/ckeditor5-utils";
import { normalizeData } from "./Data";

/**
 * Default options as used in `DataController`.
 */
export const defaultGetDataOptions: Required<Pick<NonNullable<GetDataOptions>, "rootName" | "trim">> = {
  rootName: "main",
  trim: "empty",
};

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
export class CachingDataFacade extends Plugin {
  public static readonly pluginName = "CachingDataFacade";
  static readonly #logger: Logger = LoggerProvider.getLogger(CachingDataFacade.pluginName);
  readonly #lastSetData: LastSetData = new LastSetData();
  #active = false;

  /**
   * Initializes plugin and starts waiting for the editor to become ready.
   */
  init(): void {
    const initInformation = reportInitStart(this);
    const { editor } = this;
    editor.once<EditorReadyEvent>(
      "ready",
      () => {
        this.#onEditorReady();
      },
      // Propagate the state late.
      { priority: "lowest" }
    );
    reportInitEnd(initInformation);
  }

  /**
   * Marks the data-facade as being actively propagating state to editor and
   * triggers propagation initially, if required.
   */
  #onEditorReady(): void {
    const logger = CachingDataFacade.#logger;

    this.#active = true;
    logger.debug("DataFacade gets active as Editor instance is ready.");
    this.#propagateData();
  }

  /**
   * Propagates the data to the editor, once it is ready.
   */
  #propagateData(): void {
    const logger = CachingDataFacade.#logger;

    if (this.#active) {
      logger.debug("Going to propagate data.");
      this.#lastSetData.propagateData(this.editor);
    }
  }

  /**
   * Sets the data to set at editor. If editor is not ready yet, data will
   * be forwarded as soon as the editor is ready.
   *
   * @param data - data to set
   * @param options - options for setting data
   */
  setData(data: SetDataData, options: SetDataOptions = {}): void {
    const logger = CachingDataFacade.#logger;

    this.#lastSetData.data = normalizeData(data);
    this.#lastSetData.options = options;
    logger.debug(`Set data.`, { data: this.#lastSetData });
    this.#propagateData();
  }

  /**
   * Gets the data, possibly from cache either if the editor is not ready yet,
   * or if the data are considered equal to the data set before.
   *
   * @param options - options for retrieving data; note, that despite the
   * `rootName` any other options are ignored if data are retrieved from cache.
   */
  getData(options: GetDataOptions = {}): string {
    const logger = CachingDataFacade.#logger;

    const { data: dataController } = this.editor;
    const lastSetData = this.#lastSetData;
    const { data } = lastSetData;

    if (data === undefined || (this.#active && !lastSetData.isCurrent(this.editor))) {
      // Undefined data: No data have been set: We directly forward the state from the editor.
      // isCurrent: If not current, data changed meanwhile. Read data directly from the editor.
      logger.debug("Retrieving data directly from editor.");
      return dataController.get(options);
    }

    return this.#getCachedData(data, options, dataController);
  }

  /**
   * Get cached data.
   *
   * @param data - cached data to use.
   * @param options - options, required to retrieve the `rootName` from
   * @param errorContext - context for raising error
   * @throws CKEditorError if no data exist for given `rootName` (simulates behavior of `DataController`)
   */
  #getCachedData(data: Record<string, string>, options: GetDataOptions, errorContext?: object | null): string {
    const logger = CachingDataFacade.#logger;

    const optionsWithDefaults = {
      ...defaultGetDataOptions,
      ...options,
    };

    const { rootName } = optionsWithDefaults;

    if (rootName in data) {
      const selectedData = data[rootName];
      logger.debug("Fallback to last set data.", { data: selectedData });
      return selectedData;
    }
    // We simulate the failure from DataController, as if the requested root
    // does not exist.
    throw new CKEditorError("datacontroller-get-non-existent-root", errorContext);
  }
}
