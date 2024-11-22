import { defaultStrictness, Strictness } from "./Strictness";
import { FilterRuleSetConfiguration } from "@coremedia/ckeditor5-dataprocessor-support";
import { RuleConfig } from "@coremedia/ckeditor5-dom-converter";
import { Config as CKEditorConfig, EditorConfig } from "ckeditor5";

export const COREMEDIA_RICHTEXT_CONFIG_KEY = "coremedia:richtext";

/**
 * Compatibility keys for data-processing.
 *
 * * **latest:**
 *
 *   Use latest data-processing, with pure DOM based data-processing
 *   and extra sanitation as separate task.
 *
 * * **v10:**
 *
 *   Use data-processing and corresponding configuration that got
 *   deprecated with version 11 and existed since the first final
 *   release of ckeditor-plugins. Processing provides similarities
 *   to HtmlFilter in CKEditor 4, but is rather limited regarding
 *   more complex scenarios such as mapping data-set attributes.
 */
export const compatibilityKeys: readonly string[] = ["latest", "v10"];
/**
 * The type of compatibility keys.
 */
export type CompatibilityKey = (typeof compatibilityKeys)[number];

export interface CompatibilityConfig {
  /**
   * Compatibility mode of data-processing.
   */
  readonly compatibility?: CompatibilityKey;
}

export interface CommonCoreMediaRichTextConfig extends CompatibilityConfig {
  /**
   * The strictness when validating against CoreMedia RichText 1.0 DTD.
   */
  readonly strictness?: Strictness;
}

export interface LatestCoreMediaRichTextConfig extends CommonCoreMediaRichTextConfig {
  readonly compatibility: "latest";
  readonly rules?: RuleConfig[];
}

const isLatestCoreMediaRichTextConfig = (value: unknown): value is LatestCoreMediaRichTextConfig => {
  if (value && typeof value === "object") {
    if (value.hasOwnProperty("compatibility")) {
      const { compatibility } = value as CompatibilityConfig;
      return compatibility === "latest";
    }
  }
  return false;
};

export interface V10CoreMediaRichTextConfig extends CommonCoreMediaRichTextConfig {
  readonly compatibility: "v10";
  /**
   * Custom data-processing rules to apply.
   */
  readonly rules?: FilterRuleSetConfiguration;
}

const isV10CoreMediaRichTextConfig = (value: unknown): value is V10CoreMediaRichTextConfig => {
  if (value && typeof value === "object") {
    if (value.hasOwnProperty("compatibility")) {
      const { compatibility } = value as CompatibilityConfig;
      return compatibility === "v10";
    }
  }
  return false;
};

/**
 * Configuration as given at CKEditor initialization.
 */
type CoreMediaRichTextConfig = Partial<LatestCoreMediaRichTextConfig> | V10CoreMediaRichTextConfig;
export default CoreMediaRichTextConfig;
export type DefaultCoreMediaRichTextConfig = Required<
  Pick<CommonCoreMediaRichTextConfig, "strictness" | "compatibility">
>;
export const defaultCoreMediaRichTextConfig: DefaultCoreMediaRichTextConfig = {
  strictness: defaultStrictness,
  compatibility: "latest",
};
export const getCoreMediaRichTextConfig = (
  config?: CKEditorConfig<EditorConfig>,
): CoreMediaRichTextConfig & DefaultCoreMediaRichTextConfig => {
  const rawConfig = config?.get(COREMEDIA_RICHTEXT_CONFIG_KEY) ?? {};
  const withDefaults = {
    ...defaultCoreMediaRichTextConfig,
    ...rawConfig,
  };
  const { compatibility } = withDefaults;
  if (isLatestCoreMediaRichTextConfig(withDefaults)) {
    return withDefaults;
  }
  if (isV10CoreMediaRichTextConfig(withDefaults)) {
    return withDefaults;
  }
  throw new Error(`Incompatible configuration: ${compatibility}`);
};
export const getLatestCoreMediaRichTextConfig = (
  config?: CKEditorConfig<EditorConfig>,
): LatestCoreMediaRichTextConfig & DefaultCoreMediaRichTextConfig => {
  const withDefaults = getCoreMediaRichTextConfig(config);
  if (!isLatestCoreMediaRichTextConfig(withDefaults)) {
    throw new Error(`Incompatible configuration: ${withDefaults.compatibility}`);
  }
  return withDefaults;
};
export const getV10CoreMediaRichTextConfig = (
  config?: CKEditorConfig<EditorConfig>,
): V10CoreMediaRichTextConfig & DefaultCoreMediaRichTextConfig => {
  const withDefaults = getCoreMediaRichTextConfig(config);
  if (!isV10CoreMediaRichTextConfig(withDefaults)) {
    throw new Error(`Incompatible configuration: ${withDefaults.compatibility}`);
  }
  return withDefaults;
};
