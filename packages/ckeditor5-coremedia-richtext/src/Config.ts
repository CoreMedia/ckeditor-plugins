import { Strictness } from "./RichTextSchema";
import CKEditorConfig from "@ckeditor/ckeditor5-utils/src/config";

export const COREMEDIA_RICHTEXT_CONFIG_KEY = "coremedia:richtext";

/**
 * Configuration options for CoreMedia RichText Data Processing.
 */
export default interface Config {
  /**
   * The strictness when validating against CoreMedia RichText 1.0 DTD.
   */
  strictness?: Strictness;
}

export const DEFAULT_CONFIG: Config = {
  strictness: Strictness.STRICT,
}

export function getConfig(config?: CKEditorConfig):Config {
  const customConfig: Config = <Config>config?.get(COREMEDIA_RICHTEXT_CONFIG_KEY) || {};
  return {
    ...DEFAULT_CONFIG,
    ...customConfig
  };
}
