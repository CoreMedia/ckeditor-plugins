import { setHashParam } from "./HashParams";

// Keeping the following values in line with corresponding switch-buttons helps
// to ease the integration. We may also refactor this to some more explicit
// reusable set of types to choose from.

export type InspectorState = "expanded" | "collapsed";
export type CompatibilityMode = "v10" | "latest";
export type DataType = "richtext" | "bbcode";
export type UiLanguage = "en" | "de";
export type ContentLanguage = "en" | string;
export type ReadOnlyMode = "rw" | "ro";
export type PreviewState = "hidden" | "visible";

export class ApplicationState {
  /**
   * Language for CKEditor 5 UI.
   */
  readonly #uiLanguage: UiLanguage;
  /**
   * Language for CKEditor 5 content.
   */
  readonly #contentLanguage: ContentLanguage;
  /**
   * Signals, if to open the inspector expanded or collapsed by default.
   */
  readonly #inspector: InspectorState;
  /**
   * Plugin version compatibility mode to apply.
   *
   * * `v10`: Up to version 10 we provided different data-processing for
   *   CoreMedia Rich Text.
   * * `latest`: Just assume the latest plugin version.
   */
  readonly #compatibility: CompatibilityMode;
  /**
   * The data type to support.
   */
  readonly #dataType: DataType;
  #readOnlyMode: ReadOnlyMode;
  #previewState: PreviewState;

  constructor(config?: Map<string, string | boolean>) {
    const uiLanguage = config?.get("uiLanguage") ?? "en";
    const contentLanguage = config?.get("contentLanguage") ?? "en";
    const inspector = config?.get("inspector") ?? "collapsed";
    const compatibility = config?.get("compatibility") ?? "latest";
    const dataType = config?.get("dataType") ?? "richtext";
    const readOnly = config?.get("readOnly") ?? false;
    const showPreview = config?.get("showPreview") ?? false;

    this.#uiLanguage = typeof uiLanguage === "string" && uiLanguage.toLowerCase() === "de" ? "de" : "en";
    this.#contentLanguage = typeof contentLanguage === "string" ? contentLanguage : "en";
    this.#inspector =
      typeof inspector === "string" && inspector.toLowerCase() === "expanded" ? "expanded" : "collapsed";
    this.#compatibility = typeof compatibility === "string" && compatibility.toLowerCase() === "v10" ? "v10" : "latest";
    this.#dataType = typeof dataType === "string" && dataType.toLowerCase() === "bbcode" ? "bbcode" : "richtext";
    this.#readOnlyMode = typeof readOnly === "boolean" && readOnly ? "ro" : "rw";
    this.#previewState = typeof showPreview === "boolean" && showPreview ? "visible" : "hidden";
  }

  get uiLanguage(): UiLanguage {
    return this.#uiLanguage;
  }

  set uiLanguage(language: UiLanguage) {
    if (language !== this.#uiLanguage) {
      setHashParam("uiLanguage", language, true);
    }
  }

  get contentLanguage(): ContentLanguage {
    return this.#contentLanguage;
  }

  set contentLanguage(language: ContentLanguage) {
    if (language !== this.#contentLanguage) {
      setHashParam("contentLanguage", language, true);
    }
  }

  get inspector(): InspectorState {
    return this.#inspector;
  }

  get compatibility(): CompatibilityMode {
    return this.#compatibility;
  }

  set compatibility(mode) {
    if (this.#compatibility !== mode) {
      setHashParam("compatibility", mode, true);
    }
  }

  get dataType(): DataType {
    return this.#dataType;
  }

  set dataType(dataType) {
    if (this.#dataType !== dataType) {
      setHashParam("dataType", dataType, true);
    }
  }

  get readOnlyMode(): ReadOnlyMode {
    return this.#readOnlyMode;
  }

  set readOnlyMode(mode) {
    this.#readOnlyMode = mode;
    setHashParam("readOnly", mode === "ro");
  }

  get previewState(): PreviewState {
    return this.#previewState;
  }

  set previewState(state) {
    this.#previewState = state;
    setHashParam("showPreview", state === "visible");
  }
}
