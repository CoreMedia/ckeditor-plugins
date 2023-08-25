import { Editor, EditorReadyEvent, Plugin } from "@ckeditor/ckeditor5-core";
import { reportInitEnd, reportInitStart } from "@coremedia/ckeditor5-core-common";
import { GetDataOptions, SetDataData, SetDataOptions } from "./DataControllerTypes";
import { DataApi } from "./DataApi";
import { ContextAwareCachedDataAccess } from "./ContextAwareCachedDataAccess";
import { CachedDataAccess } from "./CachedDataAccess";
import { ContextOptions } from "./Context";
import { InvalidData } from "./InvalidData";
import { RawDataAccess } from "./RawDataAccess";
import { LoggerProvider } from "@coremedia/ckeditor5-logging";

const logger = LoggerProvider.getLogger("DataFacade");

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
export class DataFacade extends Plugin implements DataApi {
  public static readonly pluginName = "DataFacade";
  readonly #dataApi: CachedDataAccess;

  constructor(editor: Editor) {
    super(editor);
    this.#dataApi = new ContextAwareCachedDataAccess(editor);
    logger.debug("Using Data Access Layer: ContextAwareCachedDataAccess");
  }

  /**
   * Initializes plugin and starts waiting for the editor to become ready.
   */
  init(): void {
    const initInformation = reportInitStart(this);
    const { editor } = this;
    editor.once<EditorReadyEvent>(
      "ready",
      () => {
        this.#dataApi.activate();
      },
      // Propagate the state late.
      { priority: "lowest" }
    );
    reportInitEnd(initInformation);
  }

  override destroy() {
    super.destroy();
    this.#dataApi.deactivate();
  }

  /**
   * Sets the data to set at editor.
   * If the editor is not ready yet, data will be forwarded as soon as the
   * editor is ready.
   *
   * @param data - data to set
   * @param options - options for setting data
   */
  setData(data: SetDataData, options: SetDataOptions & ContextOptions = {}): void {
    this.#dataApi.setData(data, options);
  }

  /**
   * Gets the data, possibly from cache either if the editor is not ready yet,
   * or if the data are considered equal to the data set before.
   *
   * @param options - options for retrieving data; note, that despite the
   * `rootName` any other options are ignored if data are retrieved from cache.
   */
  getData(options: GetDataOptions & ContextOptions = {}): string | InvalidData {
    return this.#dataApi.getData(options);
  }
}

/**
 * Tries to find the recommended `DataFacade` plugin as `DataApi` to use.
 * Falls back to providing an API for direct, uncached data-access if the
 * plugin is not installed or enabled.
 *
 * @param editor - editor to get data access API for.
 */
export const findDataApi = (editor: Editor): DataApi => {
  if (editor.plugins.has(DataFacade)) {
    const dataFacade = editor.plugins.get(DataFacade);
    if (dataFacade.isEnabled) {
      logger.debug("Found Data API: DataFacade Plugin");
      return dataFacade;
    }
  }
  const dataAccess = new RawDataAccess(editor);
  logger.debug("Found Data API: RawDataAccess");
  return dataAccess;
};
