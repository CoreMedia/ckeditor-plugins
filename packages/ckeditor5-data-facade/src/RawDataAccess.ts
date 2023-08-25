import { DataApi } from "./DataApi";
import { GetDataOptions, SetDataData, SetDataOptions } from "./DataControllerTypes";
import { Editor } from "@ckeditor/ckeditor5-core";
import Logger from "@coremedia/ckeditor5-logging/src/logging/Logger";
import LoggerProvider from "@coremedia/ckeditor5-logging/src/logging/LoggerProvider";
import { InvalidData } from "./InvalidData";

/**
 * A raw data-facade, that directly forwards requests to the `DataController`
 * of the editor instance.
 */
export class RawDataAccess implements DataApi {
  static readonly #logger: Logger = LoggerProvider.getLogger("RawDataAccess");
  readonly editor: Editor;

  /**
   * Constructor with editor to forward requests to.
   *
   * @param editor - editor instance, the facade is bound to
   */
  constructor(editor: Editor) {
    this.editor = editor;
  }

  getData(options?: GetDataOptions): string | InvalidData {
    const logger = RawDataAccess.#logger;

    const { data: dataController } = this.editor;
    const data = dataController.get(options);
    logger.debug("Got data.", { data });
    return data;
  }

  setData(data: SetDataData, options?: SetDataOptions): void {
    const logger = RawDataAccess.#logger;

    const { data: dataController } = this.editor;
    dataController.set(data, options);

    logger.debug("Set data.", { data });
  }
}
