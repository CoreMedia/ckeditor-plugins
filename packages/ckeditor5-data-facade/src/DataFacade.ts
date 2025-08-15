import { reportInitEnd, reportInitStart } from "@coremedia/ckeditor5-core-common";
import { Editor, EditorReadyEvent, Plugin, Autosave } from "ckeditor5";
import type { GetDataOptions, SetDataData, SetDataOptions } from "./DataControllerApi";
import type { DataContextOptions } from "./DataContextOptions";
import { DataFacadeController } from "./DataFacadeController";
import type { DataApi } from "./DataApi";
import type { DataFacadeConfig, Save } from "./DataFacadeConfig";

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
 * possibly important not to signal a change when the change is irrelevant. It
 * may cause overhead such as additional network communication, subsequent
 * publication steps or even may trigger translation processes.
 */
export class DataFacade extends Plugin implements DataApi {
  public static readonly pluginName = "DataFacade";
  readonly #dataController: DataFacadeController;
  readonly #config: DataFacadeConfig;
  readonly #saveFn: Save | undefined;

  /**
   * @inheritDoc
   */
  public static get requires() {
    return [Autosave] as const;
  }
  constructor(editor: Editor) {
    super(editor);
    this.#config = editor.config.get("dataFacade") ?? {};
    this.#saveFn = this.#config.save;
    this.#dataController = new DataFacadeController(editor);
  }

  /**
   * Initializes plugin and starts waiting for the editor to become ready.
   */
  init(): void {
    const initInformation = reportInitStart(this);
    const { editor } = this;
    const saveCallback = () => this.#saveFn?.(this) ?? Promise.resolve();
    if (saveCallback) {
      // Register as save adapter for `Autosave`.
      editor.plugins.get(Autosave).adapter = {
        save: () => saveCallback(),
      };
    }

    // Propagates _editor ready_. This ensures that our set data win over
    // the initialization behavior, which respects `EditorConfig.initialData`.
    editor.once<EditorReadyEvent>(
      "ready",
      () => {
        this.#dataController.init();
      },
      // Propagate the state late.
      {
        priority: "lowest",
      },
    );
    reportInitEnd(initInformation);
  }

  /**
   * Access to controller interface.
   */
  get data(): DataFacadeController {
    return this.#dataController;
  }

  /**
   * Sets the data to set at editor.
   * If the editor is not ready yet, data will be forwarded as soon as the
   * editor is ready.
   *
   * @param data - data to set
   * @param options - options for setting data
   */
  setData(data: SetDataData, options: SetDataOptions & DataContextOptions = {}): void {
    this.#dataController.setData(data, options);
  }

  /**
   * Gets the data, possibly from cache either if the editor is not ready yet,
   * or if the data are considered equal to the data set before.
   *
   * @param options - options for retrieving data; note, that despite the
   * `rootName` any other options are ignored if data are retrieved from cache.
   */
  getData(options: GetDataOptions & DataContextOptions = {}): string {
    return this.#dataController.getData(options);
  }
}
