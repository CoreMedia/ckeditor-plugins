import { setHashParam } from "./HashParams";

export type InspectorState = "expanded" | "collapsed";
export type CompatibilityMode = "v10" | "latest";
export type DataType = "richtext" | "bbcode";
export type UiLanguage = "en" | "de";

export class ApplicationState {
  /**
   * Language for CKEditor 5 UI.
   */
  readonly #uiLanguage: UiLanguage;
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
  readonly #compatibility: "v10" | "latest";
  /**
   * The data type to support.
   */
  readonly #dataType: "richtext" | "bbcode";

  constructor(config: Record<string, string | boolean> = {}) {
    const { uiLanguage, inspector, compatibility, dataType } = config;

    this.#uiLanguage = typeof uiLanguage === "string" && uiLanguage.toLowerCase() === "de" ? "de" : "en";
    this.#inspector =
      typeof inspector === "string" && inspector.toLowerCase() === "expanded" ? "expanded" : "collapsed";
    this.#compatibility = typeof compatibility === "string" && compatibility.toLowerCase() === "v10" ? "v10" : "latest";
    this.#dataType = typeof dataType === "string" && dataType.toLowerCase() === "bbcode" ? "bbcode" : "richtext";
  }

  get uiLanguage(): UiLanguage {
    return this.#uiLanguage;
  }

  set uiLanguage(language: UiLanguage) {
    if (language !== this.#uiLanguage) {
      setHashParam("uiLanguage", language, true);
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
}
