import { LoggerProvider } from "@coremedia/ckeditor5-logging";
import type { GetDataOptions, SetDataData, SetDataOptions } from "./DataControllerApi";
import { DataContextOptions } from "./DataContextOptions";
import type { Editor } from "@ckeditor/ckeditor5-core";
import { DataApi } from "./DataApi";
import { CachedData } from "./CachedData";
import { ContextMismatchError } from "./ContextMismatchError";
import { CKEditorError } from "@ckeditor/ckeditor5-utils";
import { DataFacade } from "./DataFacade";

/**
 * Controller for getting and setting data. It prefers providing data on get
 * from the previously set data if no editorial actions have been applied so
 * far.
 *
 * The controller may be used in three modes: standalone, delegating, and
 * embedded.
 *
 * **Standalone Mode**
 *
 * The _standalone_ mode may be used if you create the CKEditor instance late
 * and require to set and retrieve data already before. A standalone controller
 * may at any time be turned into a delegating controller.
 *
 * **Embedded Mode**
 *
 * The _embedded_ mode is controlled by `DataFacade` plugin. The plugin will
 * maintain this embedded instance of the controller and use it when binding
 * to the `Autosave` plugin.
 *
 * **Delegating Mode**
 *
 * A controller in _standalone_ mode may (once) be turned into delegating
 * mode. The setup requires the `DataFacade` plugin to be installed. The
 * standalone controller will then bind to the controller held by the
 * `DataFacade`, propagate any possibly already set data and will only
 * use delegate calls afterward.
 *
 * **Recommended Mixed Setup**
 *
 * The recommended setup, if you require the controller in the standalone mode,
 * is to switch to delegating mode, as soon as the editor is available. The
 * control flow may be roughly sketched as follows:
 *
 * ```typescript
 * import { DataFacade, DataFacadeController } from "@coremedia/ckeditor5-data-facade";
 *
 * const standaloneController = new DataFacadeController();
 *
 * // You may set (and get) data already now.
 * standaloneController.setData("<p>Hello Standalone!</p>");
 *
 * ClassicEditor
 *   .create( document.querySelector( '#editor' ), {
 *     plugins: [
 *       // Transitive Dependency on Autosave.
 *       DataFacade,
 *     ],
 *     autosave: {
 *       // no save needed
 *        waitingTime: 5000, // in ms
 *     },
 *     dataFacade: {
 *       save(controller) {
 *         // saveData providing a promise to store data
 *         // in an external data storage.
 *         return saveData( controller.getData() );
 *       }
 *     }
 *   })
 *   .then( (editor) => {
 *     // Will turn the controller into delegating mode.
 *     standaloneController.init(editor);
 *   })
 *   .catch( (error) => {
 *     console.error( error );
 *   } );
 *
 * // Now the standalone controller delegates to the
 * // embedded controller.
 * standaloneController.setData("<p>Hello Delegating!</p>");
 * ```
 */
export class DataFacadeController implements DataApi {
  #logger = LoggerProvider.getLogger("DataFacadeController");
  #editor?: Editor;
  #cachedData?: CachedData;
  /**
   * Possible delegate to controller directly bound to CKEditor 5 via
   * `DataFacade` plugin. Only expect to be set for a `DataFacadeController`
   * used in the standalone mode.
   */
  #delegate?: DataFacadeController;

  /**
   * Creates a data controller instance. Outside a plugin context, it is not
   * required to provide an `editor`. From within a plugin context, providing
   * the `editor` is expected.
   *
   * @param editor - optional editor to bind to
   */
  constructor(editor?: Editor) {
    this.#editor = editor;
  }

  /**
   * Initialize controller, to possibly forward data already set. Outside
   * a plugin context, requires the `editor` to be given. When used from within
   * a plugin, it is unnecessary to provide an editor. But if an editor is
   * provided, it must be the same as the original one when creating this
   * data controller instance.
   *
   * @param editor - optional editor to bind to
   */
  init(editor?: Editor): void {
    if (this.editor) {
      if (editor && this.editor !== editor) {
        throw new Error("Already initialized editor. Cannot rebind to different editor instance.");
      }
    } else {
      this.#editor = editor;
    }

    this.#initDelegation();
    this.#propagateData();
  }

  /**
   * When used in the standalone before, we will later synchronize with a
   * possibly existing `DataFacade` bound to the instance of CKEditor 5.
   *
   * Note that the `DataFacadeController` may also be used only in
   * a standalone mode, where you will not benefit from the `Autosave`
   * integration.
   */
  #initDelegation(): void {
    const logger = this.#logger;
    const editor = this.#editor;

    if (!editor) {
      return;
    }

    const { plugins } = editor;

    if (plugins.has(DataFacade)) {
      logger.debug("Running in standalone mode only. No DataFacade available for given at instance.");
      return;
    }

    const dataFacade = plugins.get(DataFacade);

    const { data: boundDataFacadeController } = dataFacade;

    if (boundDataFacadeController === this) {
      // No need to set up the delegation. This instance is already directly
      // bound to the `DataFacade`.
      return;
    }

    if (this.#delegate) {
      if (this.#delegate !== boundDataFacadeController) {
        throw new Error("Cannot switch delegation.");
      }
      logger.debug("Skipping re-initialization of delegation.");
      return;
    }

    this.#delegate = boundDataFacadeController;

    /*
     * The Expected State: Standalone Before
     *
     * We may now safely assume that this DataFacadeController got used in the
     * standalone mode. We expect that we may hold up-to-date data to possibly
     * forward to the existing DataFacadeController bound to CKEditor via
     * DataFacade plugin.
     */

    this.#initiallyPropagateDataToDelegate(boundDataFacadeController);
  }

  #initiallyPropagateDataToDelegate(delegate: DataFacadeController): void {
    const cachedData = this.#cachedData;

    if (!cachedData) {
      // Nothing to propagate.
      return;
    }

    const { data, options } = cachedData;

    delegate.setData(data, options);

    this.#cachedData = undefined;
  }

  /**
   * Access editor, this instance is bound to.
   */
  get editor(): Editor | undefined {
    return this.#delegate?.editor ?? this.#editor;
  }

  /**
   * Conditionally propagates the data to the editor. Will skip propagation,
   * if either the editor is not available yet, there are no cached data
   * (thus, no previously set data), or if this controller is running in
   * delegate mode.
   */
  #propagateData(): void {
    const { editor } = this;
    const cachedData = this.#cachedData;

    if (!editor || !cachedData || this.#delegate) {
      /*
       * Do not propagate:
       *
       * – if there is no editor, yet
       * – if we do not have any data set yet
       * – if we are in delegating mode
       */
      return;
    }

    editor.data.set(cachedData.data, cachedData.options);

    cachedData.version = editor.model.document.version;
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
    if (this.#delegate) {
      this.#delegate.setData(data, options);
      return;
    }

    this.#cachedData = {
      data,
      options,
    };

    this.#propagateData();
  }

  /**
   * Gets the data, possibly from cache either if the editor is not ready yet,
   * or if the data are considered equal to the data set before.
   *
   * @param options - options for retrieving data; note, that despite the
   * `rootName` any other options are ignored if data are retrieved from cache.
   */
  getData(options: GetDataOptions & DataContextOptions = {}): string {
    if (this.#delegate) {
      return this.#delegate.getData(options);
    }

    const { editor } = this;
    const cachedData = this.#cachedData;

    if (!cachedData) {
      return editor?.data.get(options) ?? "";
    }

    const {
      data,
      options: { context: expectedContext },
      version: cachedVersion,
    } = cachedData;
    const { context: actualContext } = options;

    if (expectedContext !== actualContext) {
      throw new ContextMismatchError(`Data Context Mismatch: actual: ${actualContext}, expected: ${expectedContext}`);
    }

    if (!editor || cachedVersion === editor.model.document.version) {
      return this.#pickData(data, options);
    }

    return editor.data.get(options);
  }

  #pickData(data: SetDataData, options: Pick<NonNullable<GetDataOptions>, "rootName">): string {
    const { rootName = "main" } = options;
    if (typeof data === "string") {
      return data;
    }
    if (rootName in data) {
      return data[rootName];
    }

    // We simulate the failure from DataController, as if the requested root
    // does not exist.
    throw new CKEditorError("datacontroller-get-non-existent-root", this.editor?.data);
  }
}
