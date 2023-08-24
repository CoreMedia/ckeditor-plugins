import { SetDataOptions } from "./DataControllerTypes";
import { Editor } from "@ckeditor/ckeditor5-core";
import Logger from "@coremedia/ckeditor5-logging/src/logging/Logger";
import LoggerProvider from "@coremedia/ckeditor5-logging/src/logging/LoggerProvider";

/**
 * Represents the data last directly set at the editor.
 */
export class LastSetData {
  static readonly #logger: Logger = LoggerProvider.getLogger(LastSetData.constructor.name);

  /**
   * The data if set.
   */
  #data?: Record<string, string>;

  /**
   * Options for setting the data.
   */
  #options: SetDataOptions = {};

  /**
   * Document version this data got set with. If we receive data
   * to be saved, we will check if the document version changed.
   * If it did not change, we return the originally stored
   * data instead. This provides the ability for consumers to do
   * a strict equivalence check on the data.
   *
   * The version may still be unset if the data has not been forwarded
   * to CKEditor.
   */
  #version?: number;

  /**
   * Propagates the data to the editor. Skips propagation, if no data have
   * been set yet.
   *
   * @param editor - editor to propagate set data to
   */
  propagateData(editor: Editor): void {
    const logger = LastSetData.#logger;

    const dataToSet = this.#data;
    if (dataToSet === undefined) {
      logger.debug("Skipping propagation: No data set yet.");
      return;
    }

    const {
      data,
      model: { document },
    } = editor;

    if (this.isCurrent(editor)) {
      // No need to propagate. The editor already has the data.
      logger.debug("Skipping propagation: Editor is already up-to-date.");
      return;
    }

    logger.debug("Propagating data to editor.", { data: dataToSet });

    data.set(dataToSet, this.#options);
    // Update the current version number.
    this.#version = document.version;
  }

  /**
   * Signals, if this state still represents the current state of the editor
   * according to its document version.
   *
   * @param editor - editor to validate the state of
   */
  isCurrent(editor: Editor): boolean {
    return this.#version === editor.model.document.version;
  }

  /**
   * Sets the data.
   *
   * **Side Effect**: Clears the tracked `version`. Thus, it signals: We know
   * that there is new data, but we do not know its related document version
   * yet.
   *
   * @param value - data to set
   */
  set data(value: Record<string, string> | undefined) {
    this.#data = value;
    // Clear tracked document version.
    this.#version = undefined;
  }

  /**
   * Retrieve the data.
   */
  get data(): Record<string, string> | undefined {
    return this.#data;
  }

  /**
   * Get defined options for setting data.
   */
  get options(): SetDataOptions {
    return this.#options;
  }

  /**
   * Define options for setting data.
   */
  set options(value: SetDataOptions) {
    this.#options = value;
  }

  /**
   * Sets the related document version. Typically called, when, at a later stage,
   * after setting the data, we now know the related document version in
   * CKEditor.
   *
   * @param value - the new document version
   */
  set version(value: number | undefined) {
    this.#version = value;
  }

  /**
   * Retrieve the document version related to the stored data, if available.
   * If not available, it is most likely that the corresponding data have not
   * reached CKEditor yet.
   */
  get version(): number | undefined {
    return this.#version;
  }

  toString(): string {
    return `LastSetData:\n\tdata: ${String(this.#data)}\n\toptions: ${this.#options}\n\tversion: ${this.#version}`;
  }
}
