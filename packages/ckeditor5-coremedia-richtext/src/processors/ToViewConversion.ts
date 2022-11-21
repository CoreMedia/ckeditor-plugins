import { MatcherPattern } from "@ckeditor/ckeditor5-engine/src/view/matcher";
import { Element } from "@ckeditor/ckeditor5-engine";
import { PriorityString } from "@ckeditor/ckeditor5-utils/src/priorities";
import { ElementConversionFunction } from "./RichTextDataProcessor";

/**
 * Symbol for toView-mapping in configuration.
 */
export const toView = Symbol("toView");
/**
 * Type of toView-mapping-symbol.
 */
export type ToView = typeof toView;

/**
 * Configuration for mapping an element to another element.
 */
export interface ToViewElementToElementConfig {
  /**
   * Data to match.
   */
  data: MatcherPattern;
  /**
   * Representation to map to in data view.
   */
  view: string | Element | ElementConversionFunction;
  /**
   * Priority.
   */
  priority?: PriorityString;
}

export interface ToViewHelpers {
  elementToElement(config: ToViewElementToElementConfig): this;
  // TODO[poc] Should be hidden in configuration API
  apply(fragment: DocumentFragment): void;
}
