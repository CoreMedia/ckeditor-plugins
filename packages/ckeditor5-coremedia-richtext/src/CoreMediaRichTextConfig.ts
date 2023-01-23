import { Strictness } from "./Strictness";
import { FilterRuleSetConfiguration } from "@coremedia/ckeditor5-dataprocessor-support/Rules";

/**
 * Configuration as given at CKEditor initialization.
 */
export default interface CoreMediaRichTextConfig {
  /**
   * The strictness when validating against CoreMedia RichText 1.0 DTD.
   */
  readonly strictness?: Strictness;
  readonly rules?: FilterRuleSetConfiguration;
}
