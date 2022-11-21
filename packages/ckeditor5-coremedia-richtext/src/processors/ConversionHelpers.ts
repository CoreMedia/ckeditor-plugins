import { MatcherPattern } from "@ckeditor/ckeditor5-engine/src/view/matcher";
import { Element } from "@ckeditor/ckeditor5-engine";
import { ElementConversionFunction } from "./RichTextDataProcessor";
import { PriorityString } from "@ckeditor/ckeditor5-utils/src/priorities";

export type FromType = MatcherPattern;
export type ToType = string | Element | ElementConversionFunction;

export interface GenericHelper {
  from: MatcherPattern;
  to: string | Element | ElementConversionFunction;
  priority?: PriorityString;
}

/**
 * Helpers (toView/toData), that expose `apply` to
 * given document fragment.
 */
export interface ApplicableHelpers {
  /**
   * Apply configured transformations.
   *
   * @param fragment
   */
  apply(fragment: DocumentFragment): void;
}
